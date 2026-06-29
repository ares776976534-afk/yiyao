import { useState, useRef, useEffect } from "react";
import { Popover, Button, Input } from "antd";
import { TypeModifyProps } from "./index.d";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

const TINT = { r: 216, g: 255, b: 0, a: 255 }; // rgba(216,255,0,1)

type Tool = "brush" | "eraser";

function array2rle(imgData: Uint8ClampedArray): string {
  const out: number[] = [];
  let curPos = -1;
  let count = 0;
  let idx = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    const isOne = imgData[i] ? 1 : 0; // R 通道
    if (isOne) {
      if (curPos === -1) curPos = idx;
      count++;
    } else if (count > 0) {
      out.push(curPos, count);
      curPos = -1;
      count = 0;
    }
    if (i === imgData.length - 4 && count > 0) {
      out.push(curPos, count);
    }
    idx++;
  }
  return out.join(" ");
}

export default function Modify(props: TypeModifyProps) {
  const { onClose, onOk, type = "modify", disableCanvas = false } = props;

  const [sliderValue, setSliderValue] = useState(10);
  const [text, setText] = useState("");
  const [tool, setTool] = useState<Tool>("brush");
  const [rle, setRle] = useState<string>("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用离屏 Canvas 进行真正的像素级绘制
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [canvasImageData, setCanvasImageData] = useState<ImageData | null>(
    null
  );

  // 撤销/重做栈 - 存储 ImageData
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const initialImageDataRef = useRef<ImageData | null>(null);

  // 初始化离屏 Canvas
  useEffect(() => {
    if (disableCanvas) return;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置白色背景
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);

    offscreenCanvasRef.current = canvas;
    offscreenCtxRef.current = ctx;

    // 保存初始状态
    const initialImageData = ctx.getImageData(0, 0, width, height);
    initialImageDataRef.current = initialImageData;
    setCanvasImageData(initialImageData);
    setUndoStack([initialImageData]);
  }, [width, height, disableCanvas]);

  // 判断是否有绘制操作
  const hasDrawingOperations = () => {
    // 方法1: 通过撤销栈长度判断（快速）
    // if (undoStack.length > 1) return true;

    // 方法2: 通过像素数据比较判断（精确）
    if (!canvasImageData || !initialImageDataRef.current) return false;

    const current = canvasImageData.data;
    const initial = initialImageDataRef.current.data;

    // 比较两个 ImageData 是否相同
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== initial[i]) {
        return true;
      }
    }
    return false;
  };

  const getPointer = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return { x: pos.x, y: pos.y };
  };

  const drawOnCanvas = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const ctx = offscreenCtxRef.current;
    if (!ctx) return;

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(${TINT.r},${TINT.g},${TINT.b},${TINT.a / 255})`;
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.lineWidth = sliderValue;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // 更新显示的图像数据
    const newImageData = ctx.getImageData(0, 0, width, height);
    setCanvasImageData(newImageData);
    layerRef.current?.batchDraw();
  };

  const beginDraw = () => {
    const p = getPointer();
    if (!p) return;
    isDrawingRef.current = true;
    setRedoStack([]); // 新动作清空重做栈
    lastPointRef.current = p;

    // 绘制起始点
    const ctx = offscreenCtxRef.current;
    if (!ctx) return;

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(${TINT.r},${TINT.g},${TINT.b},${TINT.a / 255})`;
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, sliderValue / 2, 0, Math.PI * 2);
    ctx.fill();

    const newImageData = ctx.getImageData(0, 0, width, height);
    setCanvasImageData(newImageData);
    layerRef.current?.batchDraw();
  };

  const moveDraw = () => {
    if (!isDrawingRef.current) return;
    const p = getPointer();
    if (!p || !lastPointRef.current) return;

    drawOnCanvas(lastPointRef.current.x, lastPointRef.current.y, p.x, p.y);
    lastPointRef.current = p;
  };

  const endDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    // 保存到撤销栈
    const ctx = offscreenCtxRef.current;
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    setUndoStack((prev) => [...prev, imageData]);
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;

    const newUndoStack = [...undoStack];
    const current = newUndoStack.pop()!;
    const previous = newUndoStack[newUndoStack.length - 1];

    setUndoStack(newUndoStack);
    setRedoStack((prev) => [...prev, current]);

    // 恢复到上一个状态
    const ctx = offscreenCtxRef.current;
    if (!ctx) return;
    ctx.putImageData(previous, 0, 0);
    setCanvasImageData(previous);
    layerRef.current?.batchDraw();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const toRestore = newRedoStack.pop()!;

    setRedoStack(newRedoStack);
    setUndoStack((prev) => [...prev, toRestore]);

    // 恢复状态
    const ctx = offscreenCtxRef.current;
    if (!ctx) return;
    ctx.putImageData(toRestore, 0, 0);
    setCanvasImageData(toRestore);
    layerRef.current?.batchDraw();
  };

  const handleReset = () => {
    const ctx = offscreenCtxRef.current;
    if (!ctx) return;

    // 清空画布 - 使用 clearRect 完全清除所有内容
    ctx.clearRect(0, 0, width, height);

    // 重新设置白色背景
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);

    const clearedImageData = ctx.getImageData(0, 0, width, height);
    setCanvasImageData(clearedImageData);
    setUndoStack([clearedImageData]);
    setRedoStack([]);
    setRle("");
    layerRef.current?.batchDraw();
  };

  const exportRLE = () => {
    if (disableCanvas) {
      onOk({ text, rle: "" });
      return;
    }
    const ctx = offscreenCtxRef.current;
    const canvas = offscreenCanvasRef.current;
    if (!ctx || !canvas) return;

    try {
      // 直接从离屏 Canvas 获取图像数据
      const data = ctx.getImageData(0, 0, width, height).data;
      const rleStr = array2rle(data);
      setRle(rleStr);

      // 输出可直接查看的 base64 链接
      const imgBase64 = canvas.toDataURL();

      const okData =
        type === "modify"
          ? {
              text,
              rle: rleStr,
            }
          : {
              rle: rleStr,
            };
      onOk(okData);
    } catch (error) {
      console.error("导出 RLE 失败:", error);
    }
  };

  // 监听容器大小变化
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);

    // 初始设置
    const bound = containerRef.current?.getBoundingClientRect() || {
      width: 0,
      height: 0,
    };
    setWidth(bound.width);
    setHeight(bound.height);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Popover
      open
      destroyOnHidden
      align={{
        offset: [0, 20],
      }}
      arrow={false}
      title={$t("global-1688-ai-app.PictureEditor.modify.AIgt", "AI改图")}
      content={
        <div className={styles.modify} ref={containerRef}>
          <div className={styles.controler}>
            <div className={styles.actionsContainer}>
              <Input.TextArea
                value={text}
                autoSize={{
                  minRows: 4,
                  maxRows: 4,
                }}
                onChange={(e) => {
                  setText(e.target.value);
                }}
                maxLength={1000}
                className={styles.textarea}
                placeholder={$t("global-1688-ai-app.PictureEditor.modify.jfb", "将改图灵感发给我，我来帮你执行")}
              />
              <div className={styles.actionsBtnContainer}>
                {/* <div className={styles.actionsToolGroup}>
                  <Button
                    className={styles.actionBtn}
                    style={{
                      background:
                        tool === "brush"
                          ? "rgba(235, 243, 255, 0.1)"
                          : "transparent",
                    }}
                    onClick={() => setTool("brush")}
                    disabled={disableCanvas}
                  >
                    <div className={styles.actionBtnIcon}>
                      <span>笔刷</span>
                    </div>
                  </Button>
                  <Button
                    className={styles.actionBtn}
                    style={{
                      background:
                        tool === "eraser"
                          ? "rgba(235, 243, 255, 0.1)"
                          : "transparent",
                    }}
                    onClick={() => setTool("eraser")}
                    disabled={disableCanvas}
                  >
                    <div className={styles.actionBtnIcon}>
                      <span>擦除</span>
                    </div>
                  </Button>
                  <Button
                    className={styles.actionBtn}
                    disabled={!hasDrawingOperations()}
                    onClick={handleUndo}
                  >
                    <div className={styles.actionBtnIcon}>
                      <span>撤销</span>
                    </div>
                  </Button>
                  <Button
                    className={styles.actionBtn}
                    disabled={redoStack.length === 0}
                    onClick={handleRedo}
                  >
                    <div className={styles.actionBtnIcon}>
                      <span>重做</span>
                    </div>
                  </Button>
                  <Button
                    className={styles.actionBtn}
                    disabled={!hasDrawingOperations()}
                    onClick={handleReset}
                  >
                    <div className={styles.actionBtnIcon}>
                      <span>清除选区</span>
                    </div>
                  </Button>
                </div> */}
                <div className={styles.btnContainer}>
                  <Button onClick={onClose}>{$t("global-1688-ai-app.PictureEditor.modify.cancel", "取消")}</Button>
                  <Button
                    type="primary"
                    disabled={
                      type === "modify" ? !text : !hasDrawingOperations()
                    }
                    onClick={exportRLE}
                  >
                    {type === "modify" ? $t("global-1688-ai-app.PictureEditor.modify.gt", "改图") : $t("global-1688-ai-app.PictureEditor.modify.qc", "清除")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      placement="bottom"
    />
  );
}
