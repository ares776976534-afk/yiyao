import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button, Input } from "antd";
import styles from "./index.module.scss";
import { TypeCropResult, TypeCropBox, TypeClipProps, TypeImageState, TypeResizeHandle } from "./index.d";
import { $t } from '@/i18n';

const ASPECT_RATIOS = [
  { label: $t("global-1688-ai-app.PictureEditor.clip.zy", "自由"), value: null },
  { label: $t("global-1688-ai-app.PictureEditor.clip.yt", "原图"), value: "original" },
  { label: "1:1", value: 1 },
  { label: "2:3", value: 2 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "9:16", value: 9 / 16 },
  { label: "16:9", value: 16 / 9 },
];

const RESIZE_HANDLE_SIZE = 8;

const Clip: React.FC<TypeClipProps> = (props) => {
  const { lt, rt, lb, rb, imageUrl, onClose, onOk, open } = props;

  const width = rt.x - lt.x;
  const height = lb.y - lt.y;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const [targetWidth, setTargetWidth] = useState(width);
  const [targetHeight, setTargetHeight] = useState(height);

  // 输入框临时值，用于实时显示用户输入
  const [tempWidth, setTempWidth] = useState(width.toString());
  const [tempHeight, setTempHeight] = useState(height.toString());
  const [selectedRatio, setSelectedRatio] = useState<number | string | null>(
    null
  );

  // 目标最大尺寸限制
  const [limit, setLimit] = useState({
    width: width,
    height: height,
  });

  // 标志是否正在切换比例，避免闪动
  const [isChangingRatio, setIsChangingRatio] = useState(false);

  const [imageState, setImageState] = useState<TypeImageState>({
    element: null,
    displayWidth: 0,
    displayHeight: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const [cropBox, setCropBox] = useState<TypeCropBox>({
    x: 0,
    y: 0,
    width: 200,
    height: 150,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartState, setResizeStartState] = useState<{
    cropBox: TypeCropBox;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  // 处理宽度输入框失焦
  const handleWidthBlur = useCallback(() => {
    const value = Number(tempWidth);
    if (isNaN(value) || value < 1) {
      setTempWidth(targetWidth.toString());
      return;
    }

    // 限制最大宽度不能超过limit
    const maxWidth = limit.width;
    const finalWidth = Math.min(value, maxWidth);

    // 如果有固定比例，同时调整高度
    let finalHeight = targetHeight;
    if (selectedRatio && typeof selectedRatio === "number") {
      const calculatedHeight = Math.round(finalWidth / selectedRatio);
      finalHeight = Math.min(calculatedHeight, limit.height);
    }

    // 更新实际值
    if (finalWidth !== targetWidth) {
      setTargetWidth(finalWidth);
    }
    if (finalHeight !== targetHeight) {
      setTargetHeight(finalHeight);
    }

    // 总是更新临时值为最终确定的值
    setTempWidth(finalWidth.toString());
    setTempHeight(finalHeight.toString());
  }, [
    tempWidth,
    targetWidth,
    targetHeight,
    limit.width,
    limit.height,
    selectedRatio,
  ]);

  // 处理高度输入框失焦
  const handleHeightBlur = useCallback(() => {
    const value = Number(tempHeight);
    if (isNaN(value) || value < 1) {
      setTempHeight(targetHeight.toString());
      return;
    }

    // 限制最大高度不能超过limit
    const maxHeight = limit.height;
    const finalHeight = Math.min(value, maxHeight);

    // 如果有固定比例，同时调整宽度
    let finalWidth = targetWidth;
    if (selectedRatio && typeof selectedRatio === "number") {
      const calculatedWidth = Math.round(finalHeight * selectedRatio);
      finalWidth = Math.min(calculatedWidth, limit.width);
    }

    // 更新实际值
    if (finalHeight !== targetHeight) {
      setTargetHeight(finalHeight);
    }
    if (finalWidth !== targetWidth) {
      setTargetWidth(finalWidth);
    }

    // 总是更新临时值为最终确定的值
    setTempHeight(finalHeight.toString());
    setTempWidth(finalWidth.toString());
  }, [
    tempHeight,
    targetHeight,
    targetWidth,
    limit.height,
    limit.width,
    selectedRatio,
  ]);

  // 计算调整手柄位置
  const getResizeHandles = useCallback((): TypeResizeHandle[] => {
    const isFixedRatio = selectedRatio && typeof selectedRatio === "number";

    const positions = isFixedRatio
      ? [
        { type: "nw", x: cropBox.x, y: cropBox.y, cursor: "nwse-resize" },
        {
          type: "ne",
          x: cropBox.x + cropBox.width,
          y: cropBox.y,
          cursor: "nesw-resize",
        },
        {
          type: "sw",
          x: cropBox.x,
          y: cropBox.y + cropBox.height,
          cursor: "nesw-resize",
        },
        {
          type: "se",
          x: cropBox.x + cropBox.width,
          y: cropBox.y + cropBox.height,
          cursor: "nwse-resize",
        },
      ]
      : [
        { type: "nw", x: cropBox.x, y: cropBox.y, cursor: "nwse-resize" },
        {
          type: "n",
          x: cropBox.x + cropBox.width / 2,
          y: cropBox.y,
          cursor: "ns-resize",
        },
        {
          type: "ne",
          x: cropBox.x + cropBox.width,
          y: cropBox.y,
          cursor: "nesw-resize",
        },
        {
          type: "e",
          x: cropBox.x + cropBox.width,
          y: cropBox.y + cropBox.height / 2,
          cursor: "ew-resize",
        },
        {
          type: "se",
          x: cropBox.x + cropBox.width,
          y: cropBox.y + cropBox.height,
          cursor: "nwse-resize",
        },
        {
          type: "s",
          x: cropBox.x + cropBox.width / 2,
          y: cropBox.y + cropBox.height,
          cursor: "ns-resize",
        },
        {
          type: "sw",
          x: cropBox.x,
          y: cropBox.y + cropBox.height,
          cursor: "nesw-resize",
        },
        {
          type: "w",
          x: cropBox.x,
          y: cropBox.y + cropBox.height / 2,
          cursor: "ew-resize",
        },
      ];

    return positions;
  }, [cropBox, selectedRatio]);

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

  // 检查点是否在裁剪框内
  const isPointInCropBox = useCallback(
    (x: number, y: number): boolean => {
      return (
        x >= cropBox.x &&
        x <= cropBox.x + cropBox.width &&
        y >= cropBox.y &&
        y <= cropBox.y + cropBox.height
      );
    },
    [cropBox]
  );

  // 限制裁剪框在图片范围内
  const constrainCropBox = useCallback(
    (box: TypeCropBox): TypeCropBox => {
      const { displayWidth, displayHeight, offsetX, offsetY } = imageState;

      const minSize = 20;
      const maxX = offsetX + displayWidth;
      const maxY = offsetY + displayHeight;

      // 确保裁剪框不小于最小尺寸
      const constrainedWidth = Math.max(
        minSize,
        Math.min(box.width, displayWidth)
      );
      const constrainedHeight = Math.max(
        minSize,
        Math.min(box.height, displayHeight)
      );

      // 确保裁剪框在图片范围内
      const constrainedX = Math.max(
        offsetX,
        Math.min(box.x, maxX - constrainedWidth)
      );
      const constrainedY = Math.max(
        offsetY,
        Math.min(box.y, maxY - constrainedHeight)
      );

      return {
        x: constrainedX,
        y: constrainedY,
        width: constrainedWidth,
        height: constrainedHeight,
      };
    },
    [imageState]
  );

  // 根据比例更新裁剪框 - 实现contain效果
  const updateCropBoxForRatio = useCallback(
    (ratio: number) => {
      const { displayWidth, displayHeight, offsetX, offsetY } = imageState;
      if (!displayWidth || !displayHeight) return;

      let newWidth, newHeight;

      // 实现contain效果：裁剪框至少有一个维度与图片一致
      if (displayWidth / displayHeight > ratio) {
        // 图片比较宽，以高度为准
        newHeight = displayHeight;
        newWidth = Math.round(newHeight * ratio);
      } else {
        // 图片比较高，以宽度为准
        newWidth = displayWidth;
        newHeight = Math.round(newWidth / ratio);
      }

      // 居中定位
      const newX = offsetX + (displayWidth - newWidth) / 2;
      const newY = offsetY + (displayHeight - newHeight) / 2;

      const newCropBox = {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };

      // 更新目标尺寸和限制
      setTargetWidth(newWidth);
      setTargetHeight(newHeight);
      setTempWidth(newWidth.toString());
      setTempHeight(newHeight.toString());
      setLimit({
        width: newWidth,
        height: newHeight,
      });

      // 立即更新裁剪框，避免闪动
      setCropBox(constrainCropBox(newCropBox));
    },
    [imageState, constrainCropBox]
  );

  // 处理调整大小
  const handleResize = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!isResizing || !resizeHandle || !resizeStartState) return;

      const isFixedRatio = selectedRatio && typeof selectedRatio === "number";
      const {
        cropBox: startBox,
        mouseX: startMouseX,
        mouseY: startMouseY,
      } = resizeStartState;

      const deltaX = mouseX - startMouseX;
      const deltaY = mouseY - startMouseY;

      let newBox = { ...startBox };

      if (isFixedRatio) {
        const ratio = selectedRatio as number;

        switch (resizeHandle) {
          case "nw": {
            const centerX = startBox.x + startBox.width / 2;
            const centerY = startBox.y + startBox.height / 2;
            const distance = Math.min(deltaX, deltaY * ratio);
            newBox.width = Math.max(20, startBox.width - distance * 2);
            newBox.height = newBox.width / ratio;
            newBox.x = centerX - newBox.width / 2;
            newBox.y = centerY - newBox.height / 2;
            break;
          }
          case "ne": {
            const centerX = startBox.x + startBox.width / 2;
            const centerY = startBox.y + startBox.height / 2;
            const distance = Math.max(deltaX, -deltaY * ratio);
            newBox.width = Math.max(20, startBox.width + distance * 2);
            newBox.height = newBox.width / ratio;
            newBox.x = centerX - newBox.width / 2;
            newBox.y = centerY - newBox.height / 2;
            break;
          }
          case "sw": {
            const centerX = startBox.x + startBox.width / 2;
            const centerY = startBox.y + startBox.height / 2;
            const distance = Math.max(deltaX, -deltaY * ratio);
            newBox.width = Math.max(20, startBox.width - distance * 2);
            newBox.height = newBox.width / ratio;
            newBox.x = centerX - newBox.width / 2;
            newBox.y = centerY - newBox.height / 2;
            break;
          }
          case "se": {
            const centerX = startBox.x + startBox.width / 2;
            const centerY = startBox.y + startBox.height / 2;
            const distance = Math.min(-deltaX, -deltaY * ratio);
            newBox.width = Math.max(20, startBox.width - distance * 2);
            newBox.height = newBox.width / ratio;
            newBox.x = centerX - newBox.width / 2;
            newBox.y = centerY - newBox.height / 2;
            break;
          }
        }
      } else {
        // 自由比例调整
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
      }

      setCropBox(constrainCropBox(newBox));
    },
    [
      isResizing,
      resizeHandle,
      resizeStartState,
      selectedRatio,
      constrainCropBox,
    ]
  );

  // 绘制Canvas - 使用requestAnimationFrame优化渲染
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景图片，按照传入坐标的尺寸渲染
    if (imageState.element) {
      ctx.drawImage(
        imageState.element,
        imageState.offsetX,
        imageState.offsetY,
        imageState.displayWidth,
        imageState.displayHeight
      );
    }

    // 保存当前状态
    ctx.save();

    // 绘制蒙层，但排除裁剪区域
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";

    // 使用路径裁剪，排除裁剪框区域
    ctx.beginPath();
    // 绘制整个画布区域
    ctx.rect(0, 0, canvas.width, canvas.height);
    // 挖掉裁剪框区域（逆时针绘制以创建洞）
    ctx.rect(
      cropBox.x + cropBox.width,
      cropBox.y,
      -cropBox.width,
      cropBox.height
    );
    ctx.fill("evenodd");

    // 恢复状态
    ctx.restore();

    // 绘制裁剪框边界 - 使用实线
    ctx.strokeStyle = "#1890ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

    // 绘制调整手柄 - 使用小正方形
    const handles = getResizeHandles();
    handles.forEach((handle) => {
      const halfSize = RESIZE_HANDLE_SIZE / 2;
      ctx.fillStyle = "white";
      ctx.strokeStyle = "#1890ff";
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
  }, [imageState, cropBox, getResizeHandles]);

  // 使用requestAnimationFrame优化渲染
  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  }, [drawCanvas]);

  // 鼠标事件处理
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoordinates(e.nativeEvent);

      // 检查是否点击了调整手柄
      const handle = getHandleAtPoint(x, y);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setResizeStartState({
          cropBox: { ...cropBox },
          mouseX: x,
          mouseY: y,
        });
        return;
      }

      // 检查是否点击了裁剪框内部
      if (isPointInCropBox(x, y)) {
        setIsDragging(true);
        setDragOffset({
          x: x - cropBox.x,
          y: y - cropBox.y,
        });
      }
    },
    [getCanvasCoordinates, getHandleAtPoint, isPointInCropBox, cropBox]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoordinates(e.nativeEvent);

      if (isResizing) {
        handleResize(x, y);
        return;
      }

      if (isDragging) {
        const newBox = {
          ...cropBox,
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        };
        setCropBox(constrainCropBox(newBox));
        return;
      }

      // 更新鼠标样式
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handle = getHandleAtPoint(x, y);
      if (handle) {
        const handleData = getResizeHandles().find((h) => h.type === handle);
        canvas.style.cursor = handleData?.cursor || "default";
      } else if (isPointInCropBox(x, y)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    },
    [
      getCanvasCoordinates,
      isResizing,
      isDragging,
      handleResize,
      cropBox,
      dragOffset,
      constrainCropBox,
      getHandleAtPoint,
      getResizeHandles,
      isPointInCropBox,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStartState(null);
  }, []);

  // 图片加载
  useEffect(() => {
    if (!imageUrl || !open) return;

    const img = new Image();
    // 设置crossOrigin属性以避免Canvas污染
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Canvas大小使用传入的坐标计算的宽高
      const displayWidth = width;
      const displayHeight = height;
      const scale = 1;
      const offsetX = 0;
      const offsetY = 0;

      setImageState({
        element: img,
        displayWidth,
        displayHeight,
        scale,
        offsetX,
        offsetY,
      });

      // 初始化裁剪框覆盖整个图片
      setCropBox({
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight,
      });

      setLimit({
        width: displayWidth,
        height: displayHeight,
      });
    };

    img.onerror = () => {
      console.error("图片加载失败:", imageUrl);
    };

    img.src = imageUrl;
  }, [imageUrl, open, width, height]);

  // 监听坐标变化，更新目标尺寸
  useEffect(() => {
    setTargetWidth(width);
    setTargetHeight(height);
    setTempWidth(width.toString());
    setTempHeight(height.toString());
  }, [width, height]);

  // 移除useEffect监听，改为在onBlur中处理比例约束

  // 监听目标尺寸变化，更新裁剪框大小
  useEffect(() => {
    if (
      !imageState.displayWidth ||
      !imageState.displayHeight ||
      isChangingRatio
    )
      return;

    // 计算裁剪框应该的尺寸，保持在canvas范围内
    const maxWidth = imageState.displayWidth;
    const maxHeight = imageState.displayHeight;

    const newWidth = Math.min(targetWidth, maxWidth);
    const newHeight = Math.min(targetHeight, maxHeight);

    // 计算居中位置
    const centerX = imageState.displayWidth / 2;
    const centerY = imageState.displayHeight / 2;

    const newX = Math.max(0, centerX - newWidth / 2);
    const newY = Math.max(0, centerY - newHeight / 2);

    setCropBox({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }, [
    targetWidth,
    targetHeight,
    imageState.displayWidth,
    imageState.displayHeight,
    isChangingRatio,
  ]);

  // 使用requestAnimationFrame优化渲染
  useEffect(() => {
    scheduleRender();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scheduleRender]);

  // 处理比例选择 - 避免闪动问题
  const handleRatioSelect = useCallback(
    (ratio: number | string | null) => {
      // 设置标志，阻止尺寸监听useEffect触发
      setIsChangingRatio(true);

      // 先更新状态
      setSelectedRatio(ratio);

      // 然后根据比例更新裁剪框
      if (ratio === "original" && imageState.element) {
        setTargetWidth(width);
        setTargetHeight(height);
        setTempWidth(width.toString());
        setTempHeight(height.toString());
        setCropBox({
          x: imageState.offsetX,
          y: imageState.offsetY,
          width: imageState.displayWidth,
          height: imageState.displayHeight,
        });
        setLimit({
          width: width,
          height: height,
        });
      } else if (typeof ratio === "number") {
        // 直接调用更新函数，避免useEffect的延迟
        updateCropBoxForRatio(ratio);
      } else if (ratio === null) {
        // 自由比例，不进行更改操作
      }

      // 重置标志，允许尺寸监听useEffect正常工作
      setTimeout(() => {
        setIsChangingRatio(false);
      }, 0);
    },
    [imageState, updateCropBoxForRatio, width, height]
  );

  // 执行裁剪
  const handleCrop = useCallback(() => {
    if (!imageState.element) return;

    // 创建输出Canvas
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;
    const ctx = outputCanvas.getContext("2d");

    if (!ctx) return;

    // 计算源图片上的裁剪区域
    const sourceX = (cropBox.x - imageState.offsetX) / imageState.scale;
    const sourceY = (cropBox.y - imageState.offsetY) / imageState.scale;
    const sourceWidth = cropBox.width / imageState.scale;
    const sourceHeight = cropBox.height / imageState.scale;

    // 绘制裁剪后的图片
    ctx.drawImage(
      imageState.element,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    // 计算裁剪框四个角相对于原图左上角的坐标
    const cropCoordinates = {
      topLeft: { x: sourceX, y: sourceY },
      topRight: { x: sourceX + sourceWidth, y: sourceY },
      bottomLeft: { x: sourceX, y: sourceY + sourceHeight },
      bottomRight: { x: sourceX + sourceWidth, y: sourceY + sourceHeight },
    };

    const cropArea = {
      x: sourceX,
      y: sourceY,
      width: sourceWidth,
      height: sourceHeight,
    };

    // 转换为Blob并回调，添加错误处理
    try {
      outputCanvas.toBlob((blob) => {
        if (blob) {
          const result: TypeCropResult = {
            blob,
            coordinates: cropCoordinates,
            cropArea,
          };
          onOk(result);
        }
      }, "image/png");
    } catch (error) {
      console.error("Canvas导出失败:", error);
      // 如果Canvas被污染，可以尝试其他方案
      if (error instanceof DOMException && error.name === "SecurityError") {
        console.error("Canvas被污染，无法导出。请确保图片支持CORS或来自同域。");
        // 可以在这里显示用户友好的错误提示
      }
    }
  }, [imageState, cropBox, targetWidth, targetHeight, onOk]);

  if (!open) return null;

  return createPortal(
    <div
      data-root="studio"
      className={styles.clipContainer}
      style={{ left: lt.x, top: lt.y }}
    >
      <canvas
        ref={canvasRef}
        width={imageState.displayWidth}
        height={imageState.displayHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className={styles.controlPanel} style={{ left: (rt.x - lt.x) / 2 }}>
        <div className={styles.sizeInputs}>
          <span>{$t("global-1688-ai-app.PictureEditor.clip.mbsize", "目标尺寸")}</span>
          <div className={styles.inputGroup}>
            <span>W</span>
            <input
              type="text"
              value={tempWidth}
              onChange={(e) => {
                setTempWidth(e.target.value);
              }}
              onBlur={handleWidthBlur}
            />
          </div>
          <div className={styles.inputGroup}>
            <span>H</span>
            <input
              type="text"
              value={tempHeight}
              onChange={(e) => {
                setTempHeight(e.target.value);
              }}
              onBlur={handleHeightBlur}
            />
          </div>
        </div>

        <div className={styles.ratioButtons}>
          <span>{$t("global-1688-ai-app.PictureEditor.clip.cjbl", "裁剪比例")}</span>
          <div>
            {ASPECT_RATIOS.map((ratio) => (
              <Button
                key={ratio.label}
                type={selectedRatio === ratio.value ? "primary" : "default"}
                size="small"
                onClick={() => handleRatioSelect(ratio.value)}
              >
                {ratio.label}
              </Button>
            ))}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <Button onClick={onClose}>{$t("global-1688-ai-app.PictureEditor.clip.cancel", "取消")}</Button>
          <Button type="primary" onClick={handleCrop}>{$t("global-1688-ai-app.PictureEditor.clip.cj", "裁剪")}</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Clip;
