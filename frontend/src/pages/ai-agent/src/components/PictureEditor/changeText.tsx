import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button, Tooltip } from "antd";
import styles from "./index.module.scss";
import { TypeChangeTextProps, TypeCropBox, TypeResizeHandle } from "./index.d";
import { $t } from '@/i18n';

const RESIZE_HANDLE_SIZE = 8;

// 定义框选区域结果的类型
export interface TypeChangeTextResult {
  base64: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blob: Blob;
  text?: string; // 添加文本字段
}

const ChangeText: React.FC<TypeChangeTextProps> = (props) => {
  const { open, onClose, onOk, disableCanvas = false } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // 文本框状态
  const [text, setText] = useState("");

  // 框选区域状态
  const [selectBox, setSelectBox] = useState<TypeCropBox | null>(null);
  const [isCreatingBox, setIsCreatingBox] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartState, setResizeStartState] = useState<{
    selectBox: TypeCropBox;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [showHandles, setShowHandles] = useState(true);

  // 获取鼠标在Canvas上的坐标
  const getCanvasCoordinates = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // 计算调整手柄位置
  const getResizeHandles = useCallback((): TypeResizeHandle[] => {
    if (!selectBox || !showHandles) return [];

    return [
      { type: "nw", x: selectBox.x, y: selectBox.y, cursor: "nwse-resize" },
      {
        type: "n",
        x: selectBox.x + selectBox.width / 2,
        y: selectBox.y,
        cursor: "ns-resize",
      },
      {
        type: "ne",
        x: selectBox.x + selectBox.width,
        y: selectBox.y,
        cursor: "nesw-resize",
      },
      {
        type: "e",
        x: selectBox.x + selectBox.width,
        y: selectBox.y + selectBox.height / 2,
        cursor: "ew-resize",
      },
      {
        type: "se",
        x: selectBox.x + selectBox.width,
        y: selectBox.y + selectBox.height,
        cursor: "nwse-resize",
      },
      {
        type: "s",
        x: selectBox.x + selectBox.width / 2,
        y: selectBox.y + selectBox.height,
        cursor: "ns-resize",
      },
      {
        type: "sw",
        x: selectBox.x,
        y: selectBox.y + selectBox.height,
        cursor: "nesw-resize",
      },
      {
        type: "w",
        x: selectBox.x,
        y: selectBox.y + selectBox.height / 2,
        cursor: "ew-resize",
      },
    ];
  }, [selectBox, showHandles]);

  // 检查点是否在调整手柄上
  const getHandleAtPoint = useCallback(
    (x: number, y: number): string | null => {
      const handles = getResizeHandles();
      for (const handle of handles) {
        const distance = Math.sqrt(
          Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2)
        );
        if (distance <= RESIZE_HANDLE_SIZE / 2) {
          return handle.type;
        }
      }
      return null;
    },
    [getResizeHandles]
  );

  // 检查点是否在框选区域内
  const isPointInSelectBox = useCallback(
    (x: number, y: number): boolean => {
      if (!selectBox) return false;
      return (
        x >= selectBox.x &&
        x <= selectBox.x + selectBox.width &&
        y >= selectBox.y &&
        y <= selectBox.y + selectBox.height
      );
    },
    [selectBox]
  );

  // 限制框选区域在画布范围内
  const constrainSelectBox = useCallback(
    (box: TypeCropBox): TypeCropBox => {
      const minSize = 20;
      const maxX = width;
      const maxY = height;

      const constrainedWidth = Math.max(minSize, Math.min(box.width, width));
      const constrainedHeight = Math.max(minSize, Math.min(box.height, height));

      const constrainedX = Math.max(
        0,
        Math.min(box.x, maxX - constrainedWidth)
      );
      const constrainedY = Math.max(
        0,
        Math.min(box.y, maxY - constrainedHeight)
      );

      return {
        x: constrainedX,
        y: constrainedY,
        width: constrainedWidth,
        height: constrainedHeight,
      };
    },
    [width, height]
  );

  // 处理调整大小
  const handleResize = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!isResizing || !resizeHandle || !resizeStartState) return;

      const {
        selectBox: startBox,
        mouseX: startMouseX,
        mouseY: startMouseY,
      } = resizeStartState;

      const deltaX = mouseX - startMouseX;
      const deltaY = mouseY - startMouseY;

      let newBox = { ...startBox };

      switch (resizeHandle) {
        case "nw":
          newBox.width = Math.max(20, startBox.width - deltaX);
          newBox.height = Math.max(20, startBox.height - deltaY);
          newBox.x = startBox.x + deltaX;
          newBox.y = startBox.y + deltaY;
          break;
        case "n":
          newBox.height = Math.max(20, startBox.height - deltaY);
          newBox.y = startBox.y + deltaY;
          break;
        case "ne":
          newBox.width = Math.max(20, startBox.width + deltaX);
          newBox.height = Math.max(20, startBox.height - deltaY);
          newBox.y = startBox.y + deltaY;
          break;
        case "e":
          newBox.width = Math.max(20, startBox.width + deltaX);
          break;
        case "se":
          newBox.width = Math.max(20, startBox.width + deltaX);
          newBox.height = Math.max(20, startBox.height + deltaY);
          break;
        case "s":
          newBox.height = Math.max(20, startBox.height + deltaY);
          break;
        case "sw":
          newBox.width = Math.max(20, startBox.width - deltaX);
          newBox.height = Math.max(20, startBox.height + deltaY);
          newBox.x = startBox.x + deltaX;
          break;
        case "w":
          newBox.width = Math.max(20, startBox.width - deltaX);
          newBox.x = startBox.x + deltaX;
          break;
      }

      setSelectBox(constrainSelectBox(newBox));
    },
    [isResizing, resizeHandle, resizeStartState, constrainSelectBox]
  );

  // 绘制Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 如果有框选区域，绘制半透明蓝色背景
    if (selectBox) {
      // 绘制半透明蓝色填充
      ctx.fillStyle = "rgba(100, 149, 237, 0.3)"; // 蓝色半透明
      ctx.fillRect(selectBox.x, selectBox.y, selectBox.width, selectBox.height);

      // 绘制蓝色边框
      ctx.strokeStyle = "#6495ED"; // 蓝色边框
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectBox.x,
        selectBox.y,
        selectBox.width,
        selectBox.height
      );

      // 绘制调整手柄
      if (showHandles) {
        const handles = getResizeHandles();
        handles.forEach((handle) => {
          const halfSize = RESIZE_HANDLE_SIZE / 2;
          ctx.fillStyle = "white";
          ctx.strokeStyle = "#6495ED";
          ctx.lineWidth = 2;
          ctx.fillRect(
            handle.x - halfSize,
            handle.y - halfSize,
            RESIZE_HANDLE_SIZE,
            RESIZE_HANDLE_SIZE
          );
          ctx.strokeRect(
            handle.x - halfSize,
            handle.y - halfSize,
            RESIZE_HANDLE_SIZE,
            RESIZE_HANDLE_SIZE
          );
        });
      }
    }
  }, [selectBox, showHandles, getResizeHandles]);

  // 使用requestAnimationFrame优化渲染
  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  }, [drawCanvas]);

  // 鼠标按下事件
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoordinates(e.nativeEvent);

      // 如果存在框选区域，检查是否点击了调整手柄
      if (selectBox) {
        const handle = getHandleAtPoint(x, y);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setResizeStartState({
            selectBox: { ...selectBox },
            mouseX: x,
            mouseY: y,
          });
          return;
        }

        // 检查是否点击了框选区域内部
        if (isPointInSelectBox(x, y)) {
          setIsDragging(true);
          setDragOffset({
            x: x - selectBox.x,
            y: y - selectBox.y,
          });
          return;
        }
      }

      // 如果点击了空白区域，开始创建新的框选区域
      // 隐藏现有框选区域的调整手柄
      setShowHandles(false);
      setIsCreatingBox(true);
      setDragStartPos({ x, y });
      setSelectBox({
        x,
        y,
        width: 0,
        height: 0,
      });
    },
    [getCanvasCoordinates, selectBox, getHandleAtPoint, isPointInSelectBox]
  );

  // 鼠标移动事件
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoordinates(e.nativeEvent);

      if (isResizing) {
        handleResize(x, y);
        return;
      }

      if (isDragging && selectBox) {
        const newBox = {
          ...selectBox,
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        };
        setSelectBox(constrainSelectBox(newBox));
        return;
      }

      if (isCreatingBox) {
        const newWidth = Math.abs(x - dragStartPos.x);
        const newHeight = Math.abs(y - dragStartPos.y);
        const newX = Math.min(x, dragStartPos.x);
        const newY = Math.min(y, dragStartPos.y);

        setSelectBox({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
        return;
      }

      // 更新鼠标样式
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (selectBox) {
        const handle = getHandleAtPoint(x, y);
        if (handle) {
          const handleData = getResizeHandles().find((h) => h.type === handle);
          canvas.style.cursor = handleData?.cursor || "default";
        } else if (isPointInSelectBox(x, y)) {
          canvas.style.cursor = "move";
        } else {
          canvas.style.cursor = "crosshair";
        }
      } else {
        canvas.style.cursor = "crosshair";
      }
    },
    [
      getCanvasCoordinates,
      isResizing,
      isDragging,
      isCreatingBox,
      handleResize,
      selectBox,
      dragOffset,
      constrainSelectBox,
      dragStartPos,
      getHandleAtPoint,
      getResizeHandles,
      isPointInSelectBox,
    ]
  );

  // 鼠标抬起事件
  const handleMouseUp = useCallback(() => {
    if (isCreatingBox) {
      setIsCreatingBox(false);
      setShowHandles(true); // 显示新框选区域的调整手柄
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStartState(null);
  }, [isCreatingBox]);

  // 导出框选区域数据
  const handleExport = useCallback(async () => {
    if (!selectBox) {
      // 如果没有框选区域，只返回文本
      onOk(text);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 创建临时canvas来生成整个画布的图像，包含白色文字框区域
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return;

    // 设置背景为透明
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 在框选区域绘制白色矩形表示文字框位置
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(
      selectBox.x,
      selectBox.y,
      selectBox.width,
      selectBox.height
    );

    // 获取base64
    const base64 = tempCanvas.toDataURL("image/png");

    // 获取blob
    return new Promise<void>((resolve) => {
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const result: TypeChangeTextResult = {
            base64,
            coordinates: {
              x: selectBox.x,
              y: selectBox.y,
              width: selectBox.width,
              height: selectBox.height,
            },
            blob,
            text: text || undefined, // 包含文本信息
          };
          onOk(JSON.stringify(result));
        }
        resolve();
      }, "image/png");
    });
  }, [selectBox, text, width, height, onOk]);

  // 初始化Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  // 渲染Canvas
  useEffect(() => {
    scheduleRender();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scheduleRender]);

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
    const bound = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
    setWidth(bound.width);
    setHeight(bound.height);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!open) return null;

  const disabled = disableCanvas ? !text.trim() : !text.trim() || !selectBox;

  return createPortal(
    <div
      data-root="studio"
      className={styles.changeTextContainer}
      ref={containerRef}
    >
      {/* Canvas区域用于框选 */}
      {!disableCanvas && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: "crosshair", border: "1px solid #fff" }}
        />
      )}

      {/* 控制面板 */}
      <div className={styles.controlPanel}>
        {/* 文本输入框 */}
        <div className={styles.textareaContainer}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            className={styles.textarea}
            placeholder={$t("global-1688-ai-app.PictureEditor.changeText.inimn", "输入你想修改成的目标文案，如：你好")}
          />
        </div>

        {/* 操作按钮 */}
        <div className={styles.actionButtons}>
          <Button onClick={onClose}>{$t("global-1688-ai-app.PictureEditor.changeText.cancel", "取消")}</Button>
          {disabled ? (
            <Tooltip title={$t("global-1688-ai-app.PictureEditor.changeText.qbinim", "请先选中目标区域，然后输入你想修改成的目标文案")}>
              <Button type="primary" disabled>{$t("global-1688-ai-app.PictureEditor.changeText.qd", "确定")}</Button>
            </Tooltip>
          ) : (
            <Button
              type="primary"
              onClick={handleExport}
              title={$t("global-1688-ai-app.PictureEditor.changeText.qbinim", "请先选中目标区域，然后输入你想修改成的目标文案")}
              disabled={!text.trim() || !selectBox}
            >{$t("global-1688-ai-app.PictureEditor.changeText.qd", "确定")}</Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChangeText;
