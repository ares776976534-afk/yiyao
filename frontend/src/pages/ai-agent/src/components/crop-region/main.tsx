import React, { useState, useEffect, useRef, useCallback } from "react";
import { Popover } from "antd";
import Picture from "@ali/picture";
import { Selection, ImageSize, ViewerItem, CropRegionProps } from "./types";
import { INIT_SELECTION_SCALE } from "./constants";
import {
  getImageNaturalSize,
  convertCoordinates,
  calculateCanvasSize,
  calculateInitialSelection,
  generateStyleOverrides,
  DEFAULT_CSS_VARIABLES,
  DEFAULT_FONT_STYLES,
  createClassNameGetter,
  stringToCoordinates,
  splitRegions,
  coordinatesToString,
} from "./utils";
import { CanvasDrawer } from "./canvas-drawer";
import { ThumbnailItem } from "./thumbnail-item";
import { useImageReady } from "./hooks";
import styles from "./main.module.less";
import { $t } from "@/i18n";

// 主组件
export default function CropRegionRefactor(props: CropRegionProps) {
  const {
    cropImage,
    currentRegion,
    yoloCropRegion,
    onCropChange,
    onCropClick,
    locale,
    styleConfig,
    classNameOverrides,
    viewerListClassName,
    disabled,
  } = props;
  const {
    TEXT_CONFIRM = $t("global-1688-ai-app.crop-region.main.qd", "确定"),
    TEXT_CANCEL = $t("global-1688-ai-app.crop-region.main.cancel", "取消"),
    TEXT_SELECT = $t("global-1688-ai-app.crop-region.main.sdkx", "手动框选"),
  } = locale || {};

  // 合并默认样式和自定义样式，确保独立使用时有完整的样式
  const combinedStyles = {
    ...DEFAULT_CSS_VARIABLES,
    ...DEFAULT_FONT_STYLES,
    ...generateStyleOverrides(styleConfig),
  };

  // 创建类名获取器
  const getClassName = createClassNameGetter(styles, classNameOverrides);

  // 状态管理
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [maskStyle, setMaskStyle] = useState<any>(null);
  const [selection, setSelection] = useState<Selection>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [savedSelection, setSavedSelection] = useState<Selection | null>(null);
  const [viewerList, setViewerList] = useState<ViewerItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(() => {
    return splitRegions(yoloCropRegion).indexOf(currentRegion) || 0;
  });
  const [naturalSize, setNaturalSize] = useState<ImageSize>({
    width: 0,
    height: 0,
  });
  const [displaySize, setDisplaySize] = useState<ImageSize>({
    width: 0,
    height: 0,
  });
  // 内部维护的 originYoloCropRegion 状态
  const [originYoloCropRegion, setOriginYoloCropRegion] = useState<string>("");

  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const drawerRef = useRef<CanvasDrawer | null>(null);

  // hooks
  const { waitForImageReady } = useImageReady();

  // 初始化时从 yoloCropRegion 中设置一次 originYoloCropRegion
  useEffect(() => {
    setOriginYoloCropRegion(yoloCropRegion);
  }, []);

  // 获取canvas尺寸
  const getCanvasSize = useCallback(() => {
    return calculateCanvasSize(displaySize);
  }, [displaySize]);

  // 处理选区变化
  const handleSelectionChange = useCallback((newSelection: Selection) => {
    setSelection(newSelection);
  }, []);

  // 处理区域数据的逻辑
  const processRegionData = useCallback(
    (natural: ImageSize, display: ImageSize) => {
      if (currentRegion && yoloCropRegion) {
        const currentRegionArr = [stringToCoordinates(currentRegion)];
        const yoloCropRegionList = splitRegions(yoloCropRegion).map((item) =>
          stringToCoordinates(item)
        );

        const allRegions = [...currentRegionArr, ...yoloCropRegionList];
        const canvasSize = calculateCanvasSize(display);

        const newViewerList = allRegions.map((region) => {
          const [x1, x2, y1, y2] = region;
          const canvasCoords = convertCoordinates.naturalToCanvas(
            x1,
            x2,
            y1,
            y2,
            natural.width,
            natural.height,
            canvasSize.width,
            canvasSize.height
          );
          const maskStyle = convertCoordinates.canvasToMaskStyle(
            {
              x: canvasCoords.x1,
              y: canvasCoords.y1,
              width: canvasCoords.width,
              height: canvasCoords.height,
            },
            display.width,
            display.height,
            canvasSize.width,
            canvasSize.height
          );

          return {
            cropRegion: region,
            maskStyle,
            selection: {
              x: canvasCoords.x1,
              y: canvasCoords.y1,
              width: canvasCoords.width,
              height: canvasCoords.height,
            },
          };
        });

        const current = newViewerList.shift();
        if (current) {
          setMaskStyle(current.maskStyle);
          setSelection(current.selection);
          setSavedSelection(current.selection);
        }
        setViewerList(newViewerList);
      }
    },
    [currentRegion, yoloCropRegion]
  );

  // 初始化canvas
  const initCanvas = useCallback(() => {
    if (!canvasRef.current || !naturalSize.width || !displaySize.width) return;

    const canvasSize = getCanvasSize();
    canvasRef.current.width = canvasSize.width;
    canvasRef.current.height = canvasSize.height;

    // 销毁旧的drawer
    if (drawerRef.current) {
      drawerRef.current.destroy();
    }

    // 创建新的drawer
    drawerRef.current = new CanvasDrawer(
      canvasRef.current,
      handleSelectionChange
    );

    // 优先使用上次保存的选区，否则使用默认初始选区
    const initialSelection =
      savedSelection ||
      calculateInitialSelection(canvasSize, INIT_SELECTION_SCALE);
    drawerRef.current.setSelection(initialSelection);
    setSelection(initialSelection);
  }, [
    naturalSize,
    displaySize,
    getCanvasSize,
    handleSelectionChange,
    savedSelection,
  ]);

  // 确认裁剪
  const handleConfirm = useCallback(() => {
    const canvasSize = getCanvasSize();
    const cropRegion = convertCoordinates.canvasToNatural(
      selection,
      naturalSize.width,
      naturalSize.height,
      canvasSize.width,
      canvasSize.height
    );

    const newMaskStyle = convertCoordinates.canvasToMaskStyle(
      selection,
      displaySize.width,
      displaySize.height,
      canvasSize.width,
      canvasSize.height
    );

    setMaskStyle(newMaskStyle);
    setActiveIndex(0);
    setSavedSelection(selection);

    onCropChange(cropRegion, originYoloCropRegion);
    setPopoverOpen(false);
  }, [
    selection,
    naturalSize,
    displaySize,
    getCanvasSize,
    onCropChange,
    originYoloCropRegion,
  ]);

  // 初始化数据
  const initializeData = useCallback(async () => {
    if (!cropImage || !imageRef.current) return;

    try {
      const [natural, display] = await Promise.all([
        getImageNaturalSize(cropImage),
        waitForImageReady(imageRef),
      ]);
      setNaturalSize(natural);
      setDisplaySize(display);
      processRegionData(natural, display);
    } catch (error) {
      console.error("Failed to initialize crop region:", error);
    }
  }, [cropImage, processRegionData, waitForImageReady]);

  // 处理缩略图点击
  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (index === activeIndex || !viewerList[index]) return;

      const item = viewerList[index];
      setActiveIndex(index);
      setMaskStyle(item.maskStyle);
      setSelection(item.selection);
      setSavedSelection(item.selection);
      onCropClick?.(coordinatesToString(item.cropRegion));
    },
    [activeIndex, viewerList, onCropClick]
  );

  // 弹窗内容
  const renderPopoverContent = () => {
    const canvasSize = getCanvasSize();

    return (
      <div
        className={getClassName(
          "popoverContainer",
          "cropper-popover-container"
        )}
      >
        <div
          className={getClassName("popoverContent", "cropper-popover-content")}
        >
          <div
            style={{
              position: "relative",
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            <img
              src={cropImage}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              alt="crop"
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
        <div
          className={getClassName("popoverFooter", "cropper-popover-footer")}
        >
          <div
            className={getClassName(
              "popoverFooterConfirm",
              "cropper-popover-footer-confirm"
            )}
            onClick={handleConfirm}
          >
            {TEXT_CONFIRM}
          </div>
          <div
            className={getClassName(
              "popoverFooterCancel",
              "cropper-popover-footer-cancel"
            )}
            onClick={() => setPopoverOpen(false)}
          >
            {TEXT_CANCEL}
          </div>
        </div>
      </div>
    );
  };

  // 副作用
  useEffect(() => {
    if (popoverOpen) {
      setTimeout(initCanvas, 100);
    }
  }, [popoverOpen, initCanvas]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    return () => {
      if (drawerRef.current) {
        drawerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      className={getClassName("container", "cropper-container")}
      style={combinedStyles}
    >
      <Popover
        arrow={false}
        content={renderPopoverContent()}
        trigger="click"
        placement="right"
        rootClassName={getClassName("popover", "cropper-popover")}
        // open={popoverOpen} 这期暂不支持
        open={false}
        onOpenChange={setPopoverOpen}
        getPopupContainer={(triggerNode) =>
          triggerNode.parentElement as HTMLElement
        }
        styles={{
          body: {
            padding: "var(--cropper-popover-inner-padding)",
            borderRadius: "var(--cropper-popover-inner-border-radius)",
          },
        }}
      >
        <div
          className={getClassName(
            "selectionContainer",
            "cropper-selection-container"
          )}
          style={disabled ? { cursor: "not-allowed" } : {}}
        >
          <Picture
            className={getClassName(
              "selectionImage",
              "cropper-selection-image"
            )}
            ref={imageRef}
            source={cropImage}
          />
          <div
            className={getClassName("maskContainer", "cropper-mask-container")}
            style={{
              width: displaySize.width || "100%",
              height: displaySize.height || "100%",
            }}
          >
            <div
              className={getClassName("imageMask", "cropper-image-mask")}
              style={
                maskStyle && {
                  left: `${maskStyle.left}px`,
                  top: `${maskStyle.top}px`,
                  bottom: `${maskStyle.bottom}px`,
                  right: `${maskStyle.right}px`,
                  border: "1px solid #fff",
                }
              }
            />
          </div>
          {/* 这期暂时不支持手动框选 */}
          {/* <div className={getClassName("cutBtn", "cropper-cut-btn")}>
            {TEXT_SELECT}
          </div> */}
        </div>
      </Popover>

      <div className="ml-[16px] gap-[12px]">
        {!!viewerList.length && (
          <div
            style={{
              fontSize: 14,
              color: "#7B7B8D",
              marginBottom: 8,
              marginLeft: 8,
            }}
          >
            {$t("global-1688-ai-app.crop-region.main.qcg", "请选择图片主体")}
          </div>
        )}
        <div
          className={`${getClassName("viewerList", "cropper-viewer-list")} ${
            viewerListClassName || ""
          }`.trim()}
        >
          {viewerList.map((item, index) => (
            <ThumbnailItem
              key={index}
              cropRegion={item.cropRegion}
              imageSrc={cropImage}
              disabled={disabled}
              naturalSize={naturalSize}
              isActive={activeIndex === index}
              onClick={() => {
                if (disabled) return;
                handleThumbnailClick(index);
              }}
              classNameOverrides={classNameOverrides}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
