import React, { useState, useMemo, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ConfigProvider, Switch, Popover, Button, Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { ExportIcon } from "./icon";
import { CanvasContext, isMac } from "@/components/studio-canvas";
import View from "@alife/channel-fe-materials-react-appear";
import styles from "./index.module.scss";
import {
  defaultCaptureMode,
  defaultImageFormat,
  defaultVideoFormat,
  defaultWatermarkFormat,
  defaultImageFormatOptions,
  defaultVideoFormatOptions,
} from "./defaultOptions";
import useToast from "@/components/Toast";
import { useStore } from "@/stores/context";
import { ExportPanelProps, ExtractedData, ProductModel } from "./types.d";
import { $t } from "@/i18n";
import aplus from "@/utils/log";

const isUnsetProp = (prop: any) => {
  return prop === undefined;
};

interface Target {
  id: string;
  attributes: any;
  [key: string]: any;
}

/**
 * 批量更新元素的加载状态
 * @param {Object} groups - 包含 offer、image、video 数组的数据对象
 * @param {boolean} loading - 加载状态
 * @returns {Target[]} 更新后的目标数组
 */
function updateElementsLoadingState(groups: any, loading: boolean): Target[] {
  const targets: Target[] = [];

  const addLoadingState = (item: any) => {
    targets.push({
      ...item,
      attributes: {
        ...item.attributes,
        loading,
      },
    });
  };

  groups?.offer?.forEach(addLoadingState);
  groups?.image?.forEach(addLoadingState);
  groups?.video?.forEach(addLoadingState);

  return targets;
}

/**
 * 从数据中提取图片地址、视频地址和商品模型列表
 * @param {Object} data - 包含 image、video、offer 数组的数据对象
 * @returns {ExtractedData} 提取后的数据
 */
function extractMediaAndProductData(data: any): ExtractedData {
  const aiImgageUrlList: string[] = [];
  const userImageUrlList: string[] = [];
  // 提取图片地址列表
  data?.image?.forEach((item) => {
    if (item?.attributes?.watermark) {
      aiImgageUrlList.push(item?.attributes?.src as string);
    } else {
      userImageUrlList.push(item?.attributes?.src as string);
    }
  });

  // 提取视频地址列表
  const videoUrlList: string[] =
    data?.video?.map((item: any) => item?.attributes?.src) || [];

  // 提取商品模型列表
  const productModelList: ProductModel[] =
    data?.offer?.map((item: any) => {
      // 移除下载接口不需要的属性
      const { _offerModuleSize, ...offerData } =
        item?.attributes?.offerData || {};

      return offerData || {};
    }) || [];

  return {
    aiImgageUrlList,
    userImageUrlList,
    videoUrlList,
    productModelList,
  };
}

// 检查是否有图片对象的 watermark 为 true
const hasWatermarkImage = (data: any) => {
  return (
    data?.image?.some((item: any) => item?.attributes?.watermark === true) ||
    data?.video?.some((item: any) => item?.attributes?.watermark === true) ||
    false
  );
};

const ExportPanel = observer((props: ExportPanelProps) => {
  const {
    captureMode: captureModeProps,
    imageFormat: imageFormatProps,
    videoFormat: videoFormatProps,
    watermarkFormat: watermarkFormatProps,
    imageFormatOptions: imageFormatOptionsProps,
    videoFormatOptions: videoFormatOptionsProps,
    onExport: onExportProps,
    onCaptureModeChange,
  } = props;

  const toast = useToast();
  const store = useStore();
  const canvasContext = useContext(CanvasContext);
  const canExport = canvasContext?.selectedIds?.length > 0;

  const [stateCaptureMode, setStateCaptureMode] =
    useState<boolean>(defaultCaptureMode);
  const [exportPannelOpen, setExportPannelOpen] = useState<boolean>(false);
  const [isQuickExporting, setIsQuickExporting] = useState<boolean>(false);
  const [isAdvancedExporting, setIsAdvancedExporting] =
    useState<boolean>(false);

  const captureMode = isUnsetProp(captureModeProps)
    ? stateCaptureMode
    : captureModeProps;

  const [imageFormat, setImageFormat] = useState(
    imageFormatProps || defaultImageFormat
  );

  const [videoFormat, setVideoFormat] = useState(
    videoFormatProps || defaultVideoFormat
  );

  const [watermarkFormat, setWatermarkFormat] = useState<boolean>(
    watermarkFormatProps || defaultWatermarkFormat
  );

  // 使用 useMemo 优化，只在 canvasContext 变化时重新计算
  const { groups, hasWatermark, extractedData } = useMemo(() => {
    const groups = canvasContext?.flattenSelectedElementsByType?.();
    const hasWatermark = hasWatermarkImage(groups);
    const extractedData = extractMediaAndProductData(groups);

    return {
      groups,
      hasWatermark,
      extractedData,
    };
  }, [canvasContext?.selectedIds]); // 依赖选中的元素ID列表

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // 面板展开时根据选中的数据实时渲染下载选项
      // 检查是否有Ai生成的图片
      if (hasWatermark) {
        setExportPannelOpen(newOpen);
      }
    } else {
      setExportPannelOpen(newOpen);
    }
  };

  const imageFormatOptions =
    imageFormatOptionsProps || defaultImageFormatOptions;
  const videoFormatOptions =
    videoFormatOptionsProps || defaultVideoFormatOptions;

  const onImageFormatChange = (e: RadioChangeEvent) => {
    setImageFormat(e.target.value);
  };

  const onVideoFormatChange = (e: RadioChangeEvent) => {
    setVideoFormat(e.target.value);
  };

  const hide = () => {
    setExportPannelOpen(false);
  };

  const onQuickExport = async () => {
    if (isQuickExporting || isAdvancedExporting) {
      toast.warning(
        $t("global-1688-ai-app.ExportPanel.zos", "正在导出中，请稍后再试")
      );
      return;
    }
    
    aplus.record("/alphashop.32265064.export", "CLK");

    if (!hasWatermark) {
      setIsQuickExporting(true);
      try {
        await onExport(extractedData);
      } finally {
        setIsQuickExporting(false);
      }
    } else {
      setExportPannelOpen(true);
    }
  };

  const onAdvancedExport = async () => {
    setIsAdvancedExporting(true);
    try {
      await onExport(extractedData);
      hide(); // 导出成功后关闭弹窗
    } finally {
      setIsAdvancedExporting(false);
    }
  };

  // 设置下载开始和结束的回调
  const onDownloadStart = () => {
    // 下载开始前批量更新loading状态
    const newTargets = updateElementsLoadingState(groups, true);
    canvasContext.updateElement(newTargets);
  };

  const onDownloadComplete = () => {
    // 下载结束后批量清除loading状态
    const newTargets = updateElementsLoadingState(groups, false);
    canvasContext.updateElement(newTargets);
  };

  const onExport = async (resource: ExtractedData) => {
    const exportData: { resource: ExtractedData; needWatermark?: boolean } = {
      resource,
    };

    if (hasWatermark) {
      exportData.needWatermark = watermarkFormat;
    }

    try {
      onDownloadStart();
      await onExportProps?.(exportData);
    } finally {
      onDownloadComplete();
    }
  };

  const exportOptionsContent = () => {
    // Popover关闭时，不用时刻处理选中的数据
    if (!exportPannelOpen) {
      // Popover的content必须有内容，否则无法触发打开事件
      return <div></div>;
    }

    return (
      <div className={styles.exportOptions}>
        {/* <div className={styles.exportOptionsItem}>
          <span>图像格式:</span>
          <Radio.Group
            onChange={onImageFormatChange}
            value={imageFormat}
            options={imageFormatOptions}
          />
        </div>
        <div className={styles.exportOptionsItem}>
          <span>视频格式:</span>
          <Radio.Group
            onChange={onVideoFormatChange}
            value={videoFormat}
            options={videoFormatOptions}
          />
        </div> */}
        <div className={styles.exportOptionsItem}>
          <span>
            {$t(
              "global-1688-ai-app.ExportPanel.dlopoth",
              "对下载、复制、导出内容添加显示标识:"
            )}
          </span>
          <Switch value={watermarkFormat} onChange={setWatermarkFormat} />
        </div>
        <Button
          type="primary"
          icon={<ExportIcon />}
          onClick={onAdvancedExport}
          loading={isAdvancedExporting}
        >
          {$t("global-1688-ai-app.ExportPanel.export", "导出")}
        </Button>
      </div>
    );
  };

  useEffect(() => {
    // 监听快捷键
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果是有焦点的对象触发它自身的删除行为(输入框、可编辑元素)，画布监听的全局删除则不处理
      const target = event.target as HTMLElement;

      // 当前对象是可输入对象，不处理键盘快捷键
      if (
        ["input", "textarea"].includes(target?.tagName.toLowerCase()) ||
        ["", "true"].includes(target?.getAttribute("contenteditable")!)
      ) {
        return;
      }

      const isCtrl = event.ctrlKey;
      const isCmd = event.metaKey;
      const isAltOrOption = event.altKey;
      const isShift = event.shiftKey;
      const isCtrlOrCmd = isMac ? isCmd && !isCtrl : isCtrl && !isCmd;

      // ctrl+e / cmd+e - 导出
      if (
        event.code === "KeyE" &&
        isCtrlOrCmd &&
        !isShift &&
        !isAltOrOption &&
        canvasContext?.selectedIds?.length > 0
      ) {
        event.preventDefault();
        onQuickExport();
      }
    };

    addEventListener("keydown", handleKeyDown);
    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, [onQuickExport, canvasContext?.selectedIds]);

  useEffect(() => {
    if (!store.isCustomUser) {
      aplus.record("/alphashop.32265064.gather", "EXP");
    }
  }, [store.isCustomUser]);

  return (
    <div className={styles.exportPanel}>
      <ConfigProvider
        theme={{
          token: {
            lineHeight: 1,
            fontSize: 13,
            colorText: "#fff",
          },
          components: {
            Button: {
              fontSize: 12,
              paddingInline: 10,
              fontWeight: 500,
              borderRadius: 8,
            },
            Radio: {
              colorBgContainer: "transparent",
              dotSize: 8,
            },
          },
        }}
      >
        <div className={styles.actionBar}>
          {!store.isCustomUser && (
            <div
              className={`${styles.captureMode} ${
                captureMode ? `${styles.checked}` : ""
              }`}
              onClick={() => {
                const newCaptureMode = !captureMode;
                aplus.record("/alphashop.studio.capture-mode", "CLK", {
                  action: newCaptureMode ? "open" : "close",
                });

                // 产品要求采集模式开启单独打点
                if (newCaptureMode) {
                  aplus.record("/alphashop.32265064.gather", "CLK");
                }

                if (onCaptureModeChange) {
                  onCaptureModeChange?.(newCaptureMode);
                } else {
                  setStateCaptureMode(newCaptureMode);
                }
              }}
            >
              <span>
                {$t("global-1688-ai-app.ExportPanel.cjms", "采集模式")}
              </span>
              <Switch value={captureMode} />
            </div>
          )}
          <Popover
            destroyOnHidden
            open={exportPannelOpen}
            arrow={false}
            trigger="click"
            content={exportOptionsContent}
            classNames={{
              root: styles.exportOptionsPopoverRoot,
              body: styles.exportOptionsPopoverBody,
            }}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement as HTMLElement
            }
            onOpenChange={handleOpenChange}
          >
          <View
            onFirstAppear={() => {
              aplus.record("/alphashop.32265064.export", "EXP");
            }}
          >
            <Button
              loading={isQuickExporting}
              type="primary"
              onClick={onQuickExport}
              disabled={!canExport}
            >
              {$t("global-1688-ai-app.ExportPanel.export", "导出")}
            </Button>
            </View>
          </Popover>
        </div>
      </ConfigProvider>
    </div>
  );
});

ExportPanel.displayName = "ExportPanel";

export default ExportPanel;
