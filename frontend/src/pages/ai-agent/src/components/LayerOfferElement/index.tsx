import React, { useEffect, useRef, forwardRef, useContext } from "react";
import { toJS } from "mobx";
import { Rect, Text, Image, Group, Path } from "react-konva";
import { Html, useImage } from "react-konva-utils";
import { TranslateOffer } from "../PictureEditor";
import theme from "@/components/studio-canvas/theme";
import {
  CanvasContext,
  type TypeCanvasContext,
} from "@/components/studio-canvas/context/canvas";
import PortalContainer from "@/components/studio-canvas/elements/portalContainer";
import WorkingMask from "@/components/studio-canvas/elements/workingMask";
import { UncheckedIcon, CheckedIcon } from "./Icons/Check";
import { OptimizeIcon } from "./Icons/Optimize";
import {
  BaseElement,
  ShadowElement,
  getProps,
} from "@/components/studio-canvas/elements";
import ImageElement from "@/components/studio-canvas/elements/image";
import TextElement from "@/components/studio-canvas/elements/text";
import { useStore } from "@/stores/context";
import exportOffer from "@/services/studio/exportOffer";
import { useOfferElement } from "./hooks/useOfferElement";
import { getComputedStyle } from "./config";
import {
  calcOfferInfoSize,
  updateLayerOfferText,
  calcCollapseComponentSize,
} from "./calcOffer";
import { EnumEditeState } from "./types.d";
import type {
  LayerOfferElementType,
  LayerOfferElementProps,
  SkuAttribute,
} from "./types.d";
import { offerOptimization } from "@/services";
import useToast from "@/components/Toast";
import { $t } from "@/i18n";

const offerPlatformMap = {
  "1688": {
    logo: "https://img.alicdn.com/imgextra/i4/O1CN0116oZxO1QidC7O8oMx_!!6000000002010-55-tps-28-28.svg",
    title: $t("global-1688-ai-app.LayerOfferElement.1rt", "1688商品"),
  },
  amazon: {
    logo: "https://img.alicdn.com/imgextra/i1/O1CN01aKeLqm1tGnysvnPLm_!!6000000005875-2-tps-176-176.png",
    title: "Amazon",
  },
  temu: {
    logo: "https://img.alicdn.com/imgextra/i3/O1CN01l6JAct1LmEDi5WpAY_!!6000000001341-2-tps-176-176.png",
    title: "Temu",
  },
  shopee: {
    logo: "https://img.alicdn.com/imgextra/i1/O1CN01LxQAgX1XV4ekC4d9h_!!6000000002928-2-tps-72-72.png",
    title: "Shopee",
  },
  ozon: {
    logo: "https://img.alicdn.com/imgextra/i1/O1CN01LJ3j391eSyIswarnF_!!6000000003871-2-tps-88-88.png",
    title: "Ozon",
  },
};

const fallbackSkuImage = {
  dark: "https://img.alicdn.com/imgextra/i3/O1CN01rhaaUK1ycOkCSfxbC_!!6000000006599-2-tps-240-240.png",
  light:
    "https://img.alicdn.com/imgextra/i2/O1CN01EeytpF22zzbw9fcol_!!6000000007192-2-tps-240-240.png",
};

const contentTextAutoHeight = () => {
  const STYLES = getComputedStyle();
  // 有图sku文案设置了最大宽度，因此高度需要自适应
  return {
    ...STYLES.contentText,
  };
};

// 模块标题组件
const ModuleTitleComponent = ({ module }: { module: any }) => {
  const STYLES = getComputedStyle();
  return (
    <Group
      // x={module.x}
      y={module?.y}
    >
      <Rect
        {...STYLES.sectionLabelBackground}
        width={module?.width}
        height={module?.height}
      />
      <Text
        {...STYLES.sectionLabel}
        text={module?.text || ""}
        x={module?.contentX}
        y={module?.contentY + 1}
      />
    </Group>
  );
};

// 模块文本组件
const ModuleTextComponent = ({
  module,
  onBlur,
}: {
  module: any;
  onBlur?: (newText: string) => void;
}) => {
  const STYLES = getComputedStyle();
  return (
    <Group
      // x={module.x}
      y={module.y}
    >
      <Rect
        {...STYLES.offerTitleBackground}
        x={0}
        y={0}
        width={module.width}
        height={module.height}
      />
      <TextElement
        {...STYLES.contentText}
        text={module?.text || ""}
        x={module.contentX}
        y={module.contentY + 1}
        width={module.contentWidth}
        height={module.contentHeight}
        draggable={false}
        onBlur={onBlur}
      />
    </Group>
  );
};

// 商品卡组文本展示组件块
const TextGroupComponent = ({
  id,
  module,
  onBlur,
}: {
  id?: string;
  module: any;
  onBlur?: (newText: string) => void;
}) => {
  if (!module?.children) {
    return null;
  }
  const { x, y, children } = module;
  const titleModule = children?.[0];
  const textModule = children?.[1];

  return (
    <Group
      // x={STYLES.card.padding}
      x={x}
      y={y}
    >
      {/* 标题区域 */}
      <ModuleTitleComponent module={titleModule} />

      {/* 文本区域 */}
      <ModuleTextComponent module={textModule} onBlur={onBlur} />
    </Group>
  );
};

// 列表组件
const ListComponent = ({
  id,
  module,
  onBlur,
}: {
  id?: string;
  module: any;
  onBlur?: (newText: string) => void;
}) => {
  const STYLES = getComputedStyle();
  const { x, y, width, height, children } = module;
  // 列表样式符号的大小为2px
  const listStyleSize = 3;
  const listStylePadding = 20;

  return (
    <Group nodeType="ul" x={x} y={y}>
      <Rect
        {...STYLES.sectionLabelBackground}
        width={width + listStylePadding}
        height={height}
        nodeType="ul-background"
      />

      {children?.map((item, index) => {
        const {
          x = 0,
          y = 0,
          contentY,
          contentWidth,
          contentHeight,
          text,
          firstLineHeight,
        } = item;

        // 符号距离左边距9px，右边距离文本12px
        const listStyleX = x + 9;
        // 计算列表样式符号的垂直居中坐标
        const listStyleY = contentY + y + (firstLineHeight - listStyleSize) / 2;

        return (
          <Group key={`list-item-${index}`}>
            {/* 直径3px的白色实心圆 */}
            <Path
              data="M 1,1 m -1,0 a 1,1 0 1,1 3,0 a 1,1 0 1,1 -3,0"
              fill={theme.var("--canvas-offer-color")}
              x={listStyleX}
              y={listStyleY} // 调整垂直位置，让圆点与文字对齐
            />

            <TextElement
              {...STYLES.contentText}
              text={text}
              x={x + listStylePadding}
              y={y + contentY}
              width={contentWidth}
              height={contentHeight}
              draggable={false}
              onBlur={(newText) => {
                const newPoints = children.map((item, idx) => {
                  if (idx === index) {
                    return newText;
                  }
                  return item.text;
                });
                onBlur?.(newPoints);
              }}
            />
          </Group>
        );
      })}
    </Group>
  );
};

const ListGroupComponent = ({
  id,
  module,
  onBlur,
}: {
  id?: string;
  module: any;
  onBlur?: (newText: string) => void;
}) => {
  if (!module?.children) {
    return null;
  }
  const { x, y, children } = module;
  const titleModule = children?.[0];
  const textModule = children?.[1];

  return (
    <Group x={x} y={y}>
      {/* 标题区域 */}
      <ModuleTitleComponent module={titleModule} />

      {/* 文本区域 */}
      <ListComponent module={textModule} onBlur={onBlur} />
    </Group>
  );
};

/**
 * 主图网格组件 - 支持多行布局
 */
const MainImageGrid = ({
  id,
  images,
  keyPrefix,
  spacing,
  padding,
}: {
  id: string;
  images: (HTMLImageElement | undefined)[];
  keyPrefix: string;
  spacing: number;
  padding: number;
}): React.ReactElement[] => {
  const STYLES = getComputedStyle();
  const mainImagesPerRow = STYLES.mainImageGrid.imagesPerRow;

  return images.filter(Boolean).map((image, index) => {
    const imageSize = {
      width: STYLES.mainImageGrid.itemWidth,
      height: STYLES.mainImageGrid.itemHeight,
    };

    // 计算行列位置
    const row = Math.floor(index / mainImagesPerRow);
    const col = index % mainImagesPerRow;
    const x = padding + col * (imageSize.width + spacing);
    const y = padding + row * (imageSize.height + spacing);
    const moduleId = `${id}-mainImage-${index}`;

    return (
      <ImageElement
        key={`${keyPrefix}-${index}`}
        id={moduleId}
        x={x}
        y={y}
        width={imageSize.width}
        height={imageSize.height}
        attributes={{
          src: image!,
          relateData: {
            type: "offer",
            id,
            moduleId,
            moduleName: "mainImage",
            index,
            data: {
              src: image!,
            },
          },
        }}
      />
    );
  });
};

// 有图片sku组件 - 每行2个，右侧显示对应的value
const SkuImageGrid = ({
  id,
  attributeItems,
  keyPrefix,
  padding,
  moudles,
  onBlur,
  theme,
}: {
  id: string;
  attributeItems: SkuAttribute[];
  keyPrefix: string;
  spacing: number;
  padding: number;
  moudles: any;
  theme: string;
  onBlur?: (newValue: SkuAttribute[]) => void;
}): React.ReactElement[] => {
  const STYLES = getComputedStyle();
  const skuImagesPerRow = STYLES.skuImageGrid.imagesPerRow;
  const { flatItems = [], rowCount } = moudles || {};

  const fallbackImage =
    theme === "dark" ? fallbackSkuImage.dark : fallbackSkuImage.light;

  const updateAttributeItem = (index: number, updates: any) => {
    const newValue = attributeItems.map((attrItem, idx) => {
      if (idx === index) {
        return { ...attrItem, ...updates };
      }
      return attrItem;
    });
    onBlur?.(newValue);
  };

  return attributeItems.map((item, index) => {
    const row = Math.floor(index / skuImagesPerRow);
    const col = index % skuImagesPerRow;
    const itemSize = flatItems[index] || {};
    const { y } = itemSize;
    const currentImageSize = item.imageSize || {
      width: STYLES.skuImageGrid.itemWidth,
      height: STYLES.skuImageGrid.itemHeight,
    };
    const itemContentX = itemSize?.x + padding;
    const itemContentY = itemSize?.y + padding;
    const moduleId = `${id}-skuImage-${index}`;

    return (
      <Group key={`${keyPrefix}-${index}`}>
        {/* 图片 */}
        <ImageElement
          id={moduleId}
          x={itemContentX}
          y={itemContentY}
          width={currentImageSize.width}
          height={currentImageSize.height}
          attributes={{
            src: item.image || fallbackImage,
            relateData: {
              type: "offer",
              id,
              moduleId,
              moduleName: "skuImage",
              index,
              data: {
                src: item.image || fallbackImage,
              },
            },
          }}
        />

        {/* 列分割线 */}
        <Rect
          {...STYLES.imageRect}
          height={itemSize.height}
          x={itemContentX + currentImageSize.width + padding}
          y={y}
        />

        {/* 右侧文字 */}
        <TextElement
          {...contentTextAutoHeight()}
          x={itemContentX + currentImageSize.width + padding * 2}
          y={itemContentY}
          text={item.name}
          width={STYLES.skuImageGrid.textMaxWidth}
          draggable={false}
          onBlur={(newText) => {
            updateAttributeItem(index, { name: newText || "" });
          }}
        />

        {/* 单元格行分割线 */}
        {row < rowCount - 1 && (
          <Rect
            {...STYLES.imageRect}
            width={itemSize.width}
            x={itemSize?.x}
            y={itemSize?.y + itemSize?.height}
          />
        )}

        {/* 单元格列分割线 */}
        {col > 0 && (
          <Rect
            {...STYLES.imageRect}
            height={itemSize.height}
            x={itemSize.x}
            y={y}
          />
        )}
      </Group>
    );
  });
};

// 无图片sku组件
const SkuWithoutImageGrid = ({
  id,
  attributeItems,
  keyPrefix,
  moudles,
  onBlur,
}: {
  id: string;
  attributeItems: SkuAttribute[];
  keyPrefix: string;
  moudles: any;
  onBlur?: (newValue: SkuAttribute[]) => void;
}): React.ReactElement[] => {
  const STYLES = getComputedStyle();
  const itemModule = STYLES.skuWithOutImageGrid.item;
  const { flatItems = [] } = moudles || {};

  const updateAttributeItem = (index: number, updates: any) => {
    const newValue = attributeItems.map((attrItem, idx) => {
      if (idx === index) {
        return { ...attrItem, ...updates };
      }
      return attrItem;
    });
    onBlur?.(newValue);
  };

  return attributeItems?.map((item, index) => {
    // 获取当前行的信息
    const itemSize = flatItems[index];
    const itemX = itemSize?.x || 0;
    const itemY = itemSize?.y || 0;
    const textX = itemX + itemModule.paddingLeft + itemModule.borderWidth;
    const textY = itemY + itemModule.paddingTop + itemModule.borderWidth;

    return (
      <Group key={`${keyPrefix}-${index}`}>
        {/* 背景边框 */}
        <Rect
          {...STYLES.imageRect}
          width={itemSize.width}
          height={itemSize.height - itemModule.borderWidth * 2}
          x={itemSize.x}
          y={itemSize.y}
          cornerRadius={6}
        />
        {/* 文字内容 */}
        <TextElement
          {...contentTextAutoHeight()}
          id={`${id}-skuWithoutImage-${index}`}
          x={textX}
          y={textY}
          width={itemSize.width}
          text={item.name}
          verticalAlign="middle"
          draggable={false}
          onBlur={(newText) => {
            updateAttributeItem(index, { name: newText || "" });
          }}
        />
      </Group>
    );
  });
};

// 商品属性组
const AttributesGrid = ({
  attributeItems,
  keyPrefix,
  padding,
  moudles,
  onBlur,
}: {
  attributeItems: any;
  keyPrefix: string;
  padding: number;
  moudles: any;
  onBlur?: (newValue: string[]) => void;
}): React.ReactElement[] => {
  const STYLES = getComputedStyle();
  const { children = [] } = moudles || {};

  const updateAttributeItem = (index: number, updates: any) => {
    const newValue = attributeItems.map((attrItem, idx) => {
      if (idx === index) {
        return { ...attrItem, ...updates };
      }
      return attrItem;
    });
    onBlur?.(newValue);
  };

  return attributeItems.map((attr, index) => {
    // 获取当前行的信息
    const itemSize = children[index];
    const nameModule = itemSize.children?.[0] || {};
    const valueModule = itemSize.children?.[1] || {};
    const columnWidth = itemSize.width / 2;

    return (
      <Group key={`${keyPrefix}-${index}`} y={itemSize.y}>
        {/* 属性名 */}
        <TextElement
          {...contentTextAutoHeight()}
          x={nameModule.contentX}
          y={nameModule.contentY}
          text={attr.attributeName}
          width={nameModule.contentWidth}
          height={nameModule.contentHeight}
          draggable={false}
          onBlur={(newText) => {
            updateAttributeItem(index, { attributeName: newText });
          }}
        />

        {/* 列分割线 */}
        <Rect
          {...STYLES.imageRect}
          height={itemSize.height}
          x={columnWidth}
          y={nameModule.y}
        />

        {/* 属性值 */}
        <TextElement
          {...contentTextAutoHeight()}
          x={columnWidth + valueModule.contentX}
          y={valueModule.contentY}
          text={String(attr.value)}
          width={valueModule.contentWidth}
          height={valueModule.contentHeight}
          draggable={false}
          onBlur={(newText) => {
            updateAttributeItem(index, { value: newText });
          }}
        />

        {/* 行分割线，设置在底部，除了最后一行 */}
        {index < attributeItems.length - 1 && (
          <Rect
            {...STYLES.imageRect}
            x={itemSize.x}
            y={itemSize.height}
            width={itemSize.x + itemSize.width}
            // width={20}
          />
        )}
      </Group>
    );
  });
};

const CollapseComponent = ({
  totalWidth,
  configMaxHeight,
  posY,
  isCollapsed = true,
  onClick,
}: {
  totalWidth: number;
  configMaxHeight: number;
  posY: number;
  isCollapsed?: boolean;
  onClick?: () => void;
}) => {
  const STYLES = getComputedStyle();
  const config = STYLES.collapseComponent;
  const linearGradientHeight = config.linearGradient.height;

  const displayText = isCollapsed
    ? $t("global-1688-ai-app.LayerOfferElement.expand", "查看全部")
    : $t("global-1688-ai-app.LayerOfferElement.collapse", "收起全部");
  const componentSize = calcCollapseComponentSize({ text: displayText });

  const contentHeight =
    componentSize.height - config.paddingTop - config.paddingBottom;

  // 箭头位置
  const iconX = config.paddingLeft;
  const iconY = config.paddingTop + (contentHeight - config.icon.height) / 2;

  // 文字位置
  const textX = iconX + config.icon.width + config.iconTextSpacing;
  const textY = componentSize.contentY;

  // 圆角
  const cornerRadius = STYLES.card.cornerRadius - 2;

  return (
    <Group>
      {isCollapsed && (
        <Rect
          y={configMaxHeight - linearGradientHeight}
          width={totalWidth}
          height={linearGradientHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: linearGradientHeight }}
          fillLinearGradientColorStops={config.linearGradient.colorStops}
          cornerRadius={[0, 0, cornerRadius, cornerRadius]}
        />
      )}
      <Group
        x={totalWidth / 2 - STYLES.expandCollapseIcon.width / 2}
        y={posY}
        onClick={onClick}
      >
        <Rect
          width={componentSize.width}
          height={componentSize.height}
          fill={config.bgFill}
          cornerRadius={config.cornerRadius}
        />
        <Path
          data="M7.88158,20.076905033639527L7.88321,20.075303233639527C7.99753,19.963489233639525,8.18957,19.974207233639525,8.314779999999999,20.096671133639525L14.069,25.724841433639526C14.2006,25.853561433639527,14.2006,26.062271433639527,14.069,26.190991433639525L13.8307,26.424071433639526C13.6991,26.552801433639527,13.4857,26.552801433639527,13.3541,26.424071433639526L8.08663,21.271991433639528L2.813598,26.429521433639525C2.681991,26.558251433639526,2.468611,26.558251433639526,2.337003,26.429521433639525L2.0987059,26.196451433639528C1.9670976,26.067721433639527,1.9670982,25.859011433639527,2.0987059,25.730291433639525L7.8529,20.102123433639527C7.86212,20.093110733639527,7.8717,20.084703133639525,7.88158,20.076905033639527Z"
          fill={config.fill}
          scaleY={isCollapsed ? -1 : 1}
          x={iconX}
          y={iconY}
          offsetY={isCollapsed ? 31 : 15}
        />
        <Text
          text={displayText}
          fontSize={config.text.fontSize}
          lineHeight={config.text.lineHeight}
          fill={config.fill}
          verticalAlign={config.text.verticalAlign}
          x={textX}
          y={textY}
        />
      </Group>
    </Group>
  );
};

const Element = forwardRef<any, LayerOfferElementProps>((props, ref) => {
  const { id: layerId, loading } = props;
  const { baseProps } = getProps(props);
  const { offerData, platform, language = "zh" } = props.attributes || {};
  const _offerModuleSize = offerData?._offerModuleSize || {};
  const _modules = _offerModuleSize?.children || {};

  const skuWithImageModule = _modules?.skuWithImage || {};
  const skuWithOutImageModule = _modules?.skuWithOutImage || {};

  const store = useStore();
  const distributeMode = store.distributeMode;
  const canvasContext = useContext(CanvasContext);
  const {
    selectedIds = [],
    isGrabbing,
    isDragging,
    isTransforming,
    isDrawingRect,
    isScaling,
    isMoving,
  } = canvasContext;

  const baseRef = useRef<any>();

  const isSelected =
    selectedIds?.length === 1 && selectedIds?.includes(layerId);
  const isChecked = distributeMode && selectedIds.includes(layerId);
  // 频繁操作
  const quikChange =
    isGrabbing ||
    isDragging ||
    isDrawingRect ||
    isTransforming ||
    isScaling ||
    isMoving;

  const {
    state: { editState, editBatchIds, isCollapsed },
    refs: { groupRef },
    textWidths: { loadingTextWidth },
    data: {
      mainImages,
      attributes,
      skuWithImage,
      skuWithoutImage,
      allImagesLoaded,
    },
    dimensions: { contentWidth, totalWidth, totalHeight },
    positions: {
      logoPosition,
      titlePosition,
      mainImagePosition,
      skuWithImagePosition,
      skuWithoutImagePosition,
      attributesPosition,
      keywordsPosition,
      sellingPointsPosition,
      descriptionPosition,
    },
    // state函数
    setEditState,
    setEditBatchIds,
    setIsCollapsed,
  } = useOfferElement({
    offerData,
  });

  const STYLES = getComputedStyle();

  const panelTitleData = offerPlatformMap[platform || "1688"];

  const logoImageData = useImage(panelTitleData.logo, "anonymous")[0];

  const toast = useToast();
  const translateOfferRef = useRef<any>(null);

  // 通知baseElement里的占位元素更新宽高
  const hangleUpdateSize = (height) => {
    baseRef?.current?.onChildrenChange?.({
      width: totalWidth,
      height,
    });
  };

  // 设置下载开始和结束的回调
  const onLoadStart = (toastText, toastKey: string) => {
    toast.loading(toastText, {
      duration: 0,
      key: toastKey,
    });
    // 通过更新元素属性来触发图片的loading状态
    canvasContext.updateElement(props.id as string, {
      attributes: {
        ...props.attributes,
      },
      loading: true,
    });
  };

  const onLoadComplete = (toastKey: string) => {
    // 下载结束后清除loading状态
    canvasContext.updateElement(props.id as string, {
      attributes: {
        ...props.attributes,
      },
      loading: false,
    });
    toast.destroy(toastKey);
  };

  const downloadFile = async (params: Record<string, string>[]) => {
    try {
      await exportOffer(params);
    } catch (error) {
      toast.error(
        $t(
          "global-1688-ai-app.studio-canvas.element.downloadFailed",
          "下载失败",
        ),
      );
    }
  };

  const handleMenuAction = async (key, params, batchIds?: string[]) => {
    let toastId = "";

    switch (key) {
      case EnumEditeState.optimize:
        toastId = `${layerId}_optimize`;

        onLoadStart(
          $t(
            "global-1688-ai-app.LayerOfferElement.productOptimizing",
            "商品优化中",
          ),
          toastId,
        );

        // 批量操作
        if (batchIds?.length) {
          batchIds.forEach((batchId) => {
            const _ref = canvasContext.getRef(batchId);

            if (_ref) {
              _ref?.handleMenuAction?.(key, params);
            }
          });
          return;
        }

        // 调用优化接口
        try {
          const productModel = toJS(offerData);
          const res = await offerOptimization({
            productModel,
            optimizationContext: {
              sourceLanguage: language,
              platform: params.platform,
              targetLanguage: params.language,
              optimizations: [
                "title",
                "mainImage",
                "detailImage",
                "productAttribute",
                "sku",
                "platform", // 平台优化字段必传
              ],
            },
          });
          if (res) {
            const _offerModuleSize = calcOfferInfoSize(res);
            canvasContext?.addElement(
              {
                type: "offer",
                attributes: {
                  platform: params.platform,
                  language: params.language,
                  offerData: {
                    ...res,
                    _offerModuleSize,
                  },
                },
                width: _offerModuleSize?.width || 0, // 默认宽度
                height: _offerModuleSize?.height || 0, // 默认高度
              },
              "inline",
            );
          }
        } catch (e) {}

        break;
      case "download":
        toastId = `${layerId}_download`;
        onLoadStart(
          $t(
            "global-1688-ai-app.LayerOfferElement.productDownloading",
            "商品下载中",
          ),
          toastId,
        );
        const jsOfferData = toJS(offerData);
        await downloadFile([jsOfferData]);
        onLoadComplete(toastId);
        break;
      default:
        break;
    }

    setEditState(EnumEditeState.null);
    setEditBatchIds(undefined);
    onLoadComplete(toastId);
  };

  const updateModuleText = (relateData: any, newValue: any) => {
    updateLayerOfferText(
      {
        id: props.id,
        value: newValue,
        ...relateData,
      },
      canvasContext,
    );
  };

  const configMaxHeight = STYLES.card.maxHeight;
  const clipHeightConfig = isCollapsed ? { clipHeight: configMaxHeight } : {};

  useEffect(() => {
    // 所有图片加载完成了视为商品卡片加载完成
    if (allImagesLoaded) {
      hangleUpdateSize(isCollapsed ? configMaxHeight : totalHeight);
    }
  }, [isCollapsed, allImagesLoaded]);

  // 注册菜单点击事件
  const _ref = canvasContext.getRef(layerId as string);

  if (_ref) {
    _ref.onMenuClick = ({ key }, batchIds?: string[]) => {
      setEditState(key as EnumEditeState);
      setEditBatchIds(batchIds);
    };

    _ref.handleMenuAction = handleMenuAction;

    _ref.loading = (loading: boolean) => {
      // 通过更新元素属性来触发图片的loading状态
      canvasContext.updateElement(props.id as string, {
        attributes: {
          ...props.attributes,
        },
        loading: !!loading,
      });
    };

    _ref.getData = () => {
      return {
        id: props.id,
        type: "offer",
        downloadData: offerData,
      };
    };
  }

  return (
    <BaseElement
      ref={baseRef}
      {...baseProps}
      maxHeight={isCollapsed ? configMaxHeight : Infinity}
      attributes={toJS(props.attributes)}
    >
      <ShadowElement id={`${layerId}-shadow`} listening={!loading}>
        <Group
          ref={groupRef}
          clipX={0}
          clipY={0}
          clipWidth={totalWidth}
          {...clipHeightConfig}
        >
          {/* 卡片背景 - 根据布局方向自适应 */}
          <Rect
            width={totalWidth}
            height={isCollapsed ? configMaxHeight : totalHeight}
            fill={theme.var("--canvas-offer-bg")}
            cornerRadius={STYLES.card.cornerRadius}
          />

          {/* 右上角选中图标, 32 * 32 */}
          {distributeMode && (
            <Group
              x={
                totalWidth -
                STYLES.distributeMode.icon.size -
                STYLES.card.padding
              }
              y={STYLES.card.padding}
            >
              {isChecked ? (
                <CheckedIcon
                  size={STYLES.distributeMode.icon.size}
                  fill={theme.var("--color-canvas-element-selected")}
                />
              ) : (
                <UncheckedIcon size={STYLES.distributeMode.icon.size} />
              )}
              {/* <Text text="选中该商品" /> */}
            </Group>
          )}

          {/* logo区域 */}
          <Group x={logoPosition.x} y={logoPosition.y}>
            {logoImageData && (
              <Image
                image={logoImageData}
                // attributes={{
                //   src: 'https://img.alicdn.com/imgextra/i4/O1CN01xAjf8v1x638Uhm7AI_!!6000000006393-2-tps-32-32.png',
                // }}
                {...STYLES.logo.icon}
                y={(STYLES.logo.text.height - STYLES.logo.icon.height) / 2}
              />
            )}
            <Text
              {...STYLES.logo.text}
              x={STYLES.logo.icon.width + STYLES.logo.spacing}
              text={panelTitleData.title}
            />
          </Group>

          {allImagesLoaded ? (
            <>
              {/* 标题区域 */}
              <TextGroupComponent
                module={{
                  ..._modules?.title,
                  x: titlePosition.x,
                  y: titlePosition.y,
                }}
                onBlur={(newText) => {
                  updateModuleText(
                    {
                      moduleName: "title",
                    },
                    newText,
                  );
                }}
              />

              {/* 关键词区域 */}
              <TextGroupComponent
                module={{
                  ..._modules?.keywords,
                  x: keywordsPosition.x,
                  y: keywordsPosition.y,
                }}
                onBlur={(newText) => {
                  updateModuleText(
                    {
                      moduleName: "keywords",
                    },
                    newText.split(","),
                  );
                }}
              />

              {/* 商品主图区域 */}
              <Group x={mainImagePosition.x} y={mainImagePosition.y}>
                {/* 主图label */}
                <ModuleTitleComponent
                  module={_modules?.mainImage?.children?.[0]}
                />

                {/* 主图图片 */}
                <Group y={_modules?.mainImage?.children?.[1]?.y}>
                  {/* 图片背景 */}
                  {mainImages.length > 0 && (
                    <Rect
                      {...STYLES.imageBackground}
                      width={_modules?.mainImage?.width}
                      height={_modules?.mainImage?.children?.[1]?.height}
                    />
                  )}

                  {/* 渲染商品主图网格 - 横向排列 */}
                  <MainImageGrid
                    id={layerId}
                    images={mainImages}
                    keyPrefix="main"
                    spacing={STYLES.mainImageGrid.spacing}
                    padding={STYLES.imageBackground.padding}
                  />
                </Group>
              </Group>

              {/* 5点详描区域 */}
              <ListGroupComponent
                module={{
                  ..._modules?.sellingPoints,
                  x: sellingPointsPosition.x,
                  y: sellingPointsPosition.y,
                }}
                onBlur={(newText) => {
                  updateModuleText(
                    {
                      moduleName: "sellingPoints",
                    },
                    newText,
                  );
                }}
              />

              {/* 卖点详情区域 */}
              <TextGroupComponent
                module={{
                  ..._modules?.description,
                  x: descriptionPosition.x,
                  y: descriptionPosition.y,
                }}
                onBlur={(newText) => {
                  updateModuleText(
                    {
                      moduleName: "description",
                    },
                    newText,
                  );
                }}
              />

              {/* 有图sku区域 - skuWithImage */}
              {skuWithImage?.value?.length > 0 && (
                <Group x={skuWithImagePosition.x} y={skuWithImagePosition.y}>
                  {/* sku标题区域 */}
                  <ModuleTitleComponent
                    module={skuWithImageModule?.children?.[0]}
                  />

                  {/* 有图sku区域 - sku图片 */}
                  <Group y={skuWithImageModule?.children?.[1]?.y}>
                    {/* 有图sku区域 - 背景 */}
                    <Rect
                      {...STYLES.imageBackground}
                      width={skuWithImageModule?.children?.[1]?.width}
                      height={skuWithImageModule?.children?.[1]?.height}
                    />

                    {/* sku最外层边框 */}
                    <Rect
                      {...STYLES.imageRect}
                      width={
                        skuWithImageModule?.children?.[1]?.width -
                        STYLES.imageBackground.padding * 2
                      }
                      height={
                        skuWithImageModule?.children?.[1]?.height -
                        STYLES.imageBackground.padding * 2
                      }
                      x={STYLES.imageBackground.padding}
                      y={STYLES.imageBackground.padding}
                    />
                    <SkuImageGrid
                      id={layerId}
                      attributeItems={skuWithImage.value} // sku图片数组
                      keyPrefix={`sku-${skuWithImage.prop}`} // 图片key前缀
                      spacing={STYLES.skuImageGrid.spacing}
                      padding={STYLES.skuImageGrid.skuRectSpacing}
                      moudles={skuWithImageModule?.children?.[1]}
                      onBlur={(newValue) => {
                        updateModuleText(
                          {
                            moduleName: "skuProps",
                            index: 0,
                          },
                          newValue,
                        );
                      }}
                      theme={store.theme}
                    />
                  </Group>
                </Group>
              )}

              {/* 无图sku区域 - skuWithoutImage */}
              {skuWithoutImage?.value?.length > 0 && (
                <Group
                  x={skuWithoutImagePosition.x}
                  y={skuWithoutImagePosition.y}
                >
                  {/* 无图sku标题区域 */}
                  <ModuleTitleComponent
                    module={skuWithOutImageModule?.children?.[0]}
                  />

                  {/* 无图sku区域 - sku value */}
                  <Group y={skuWithOutImageModule?.children?.[1]?.y}>
                    {/* 无图sku区域 - 背景 */}
                    <Rect
                      {...STYLES.imageBackground}
                      width={skuWithOutImageModule?.children?.[1]?.width}
                      height={skuWithOutImageModule?.children?.[1]?.height}
                    />

                    {/* 渲染无图SKU网格 表格形式显示 */}
                    <SkuWithoutImageGrid
                      id={layerId}
                      attributeItems={skuWithoutImage.value}
                      keyPrefix={`sku-${skuWithoutImage.prop}`}
                      moudles={skuWithOutImageModule?.children?.[1]}
                      onBlur={(newValue) => {
                        updateModuleText(
                          {
                            moduleName: "skuProps",
                            index: 1,
                          },
                          newValue,
                        );
                      }}
                    />
                  </Group>
                </Group>
              )}

              {/* 属性区域 - 表格形式显示商品属性 */}
              <Group x={attributesPosition.x} y={attributesPosition.y}>
                {/* 属性标题 */}
                <ModuleTitleComponent
                  module={_modules?.attributes?.children?.[0]}
                />

                {/* 属性表格 */}
                <Group y={_modules?.attributes?.children?.[1]?.y}>
                  {/* 背景 */}
                  <Rect
                    {...STYLES.imageBackground}
                    width={_modules?.attributes?.width}
                    height={_modules?.attributes?.children?.[1]?.height}
                  />

                  {/* 边框 */}
                  <Rect
                    {...STYLES.imageRect}
                    width={
                      _modules?.attributes?.width -
                      STYLES.imageBackground.padding * 2
                    }
                    height={
                      _modules?.attributes?.children?.[1]?.height -
                      STYLES.imageBackground.padding * 2
                    }
                    x={STYLES.imageBackground.padding}
                    y={STYLES.imageBackground.padding}
                  />

                  <Group
                    x={STYLES.imageBackground.padding}
                    y={STYLES.imageBackground.padding}
                  >
                    <AttributesGrid
                      attributeItems={attributes}
                      keyPrefix="attributes"
                      padding={STYLES.skuImageGrid.skuRectSpacing}
                      moudles={{
                        ..._modules?.attributes?.children?.[1],
                        width: _modules?.attributes?.width,
                      }}
                      onBlur={(newValue) => {
                        updateModuleText(
                          {
                            moduleName: "productAttribute",
                          },
                          newValue,
                        );
                      }}
                    />
                  </Group>
                </Group>
              </Group>

              {/* 折叠 / 展开按钮 */}
              {isCollapsed ? (
                // 展开按钮
                <CollapseComponent
                  totalWidth={totalWidth}
                  configMaxHeight={configMaxHeight}
                  posY={
                    configMaxHeight -
                    STYLES.expandCollapseIcon.height -
                    STYLES.card.padding
                  }
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    setIsCollapsed(false);
                    hangleUpdateSize(totalHeight);
                  }}
                />
              ) : (
                // 折叠按钮
                <CollapseComponent
                  totalWidth={totalWidth}
                  configMaxHeight={configMaxHeight}
                  posY={
                    _offerModuleSize.height -
                    STYLES.expandCollapseIcon.height -
                    STYLES.card.padding
                  }
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    setIsCollapsed(true);
                    hangleUpdateSize(configMaxHeight);
                  }}
                />
              )}
            </>
          ) : (
            <Group>
              <Text
                x={contentWidth / 2 - loadingTextWidth / 2}
                y={configMaxHeight / 2}
                {...STYLES.contentText}
                text={$t(
                  "global-1688-ai-app.LayerOfferElement.pcoiz",
                  "商品信息提取中",
                )}
                opacity={0.5}
              />
            </Group>
          )}
        </Group>

        {/* 卡片背景border虚线 */}
        <PortalContainer
          parentRef={baseRef.current?.rectRef}
          transformFunc={(points) => {
            return {
              left: points.lt.x + "px",
              top: points.lt.y + "px",
              width: points.rt.x - points.lt.x + "px",
              height: points.lb.y - points.lt.y + "px",
            };
          }}
          style={{
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              zIndex: -1,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              /* 圆角由下方 svg rect 的 rx 表现；勿 overflow:hidden，否则会裁掉 stroke 落在矩形外的半条线宽，初始缩放下顶/右侧虚线常缺一段 */
              overflow: "visible",
            }}
          >
            <svg
              width="100%"
              height="100%"
              style={{ display: "block", overflow: "visible" }}
            >
              <rect
                width="100%"
                height="100%"
                fill="none"
                rx={STYLES.card.cornerRadius * (canvasContext.scale || 1)}
                stroke="var(--canvas-offer-border-color)"
                strokeWidth={
                  STYLES.cardRect.strokeWidth * (canvasContext.scale || 1)
                }
                strokeDasharray={`${
                  STYLES.cardRect.dash[0] * (canvasContext.scale || 1)
                } ${STYLES.cardRect.dash[1] * (canvasContext.scale || 1)}`}
                strokeLinecap="square"
              />
            </svg>
          </div>
        </PortalContainer>

        {/* 处理中的loading */}
        {!!loading && <WorkingMask parentRef={baseRef.current?.rectRef} />}

        {!quikChange && editState === EnumEditeState.optimize && !loading && (
          <Html>
            <TranslateOffer
              open
              ref={translateOfferRef}
              type="optimize"
              onClose={() => {
                // setIsCollapsed(false);
                setEditState(null);
                setEditBatchIds(undefined);
              }}
              onOk={(params) => {
                handleMenuAction(EnumEditeState.optimize, params, editBatchIds);
              }}
            />
          </Html>
        )}
      </ShadowElement>
    </BaseElement>
  );
}) as LayerOfferElementType;

Element.icon = "";
Element.displayName = $t(
  "global-1688-ai-app.LayerOfferElement.product",
  "商品",
);

// 定义菜单
Element.getMenu = () => {
  return [
    {
      key: EnumEditeState.optimize,
      label: $t("global-1688-ai-app.LayerOfferElement.yjyh", "一键优化"),
      icon: <OptimizeIcon />,
      logmap: {
        logKey: "/alphashop.32265064.listingoptimize",
      },
    },
  ];
};
// 替换局部模块
Element.replaceModule = (relateData: any, canvasContext: TypeCanvasContext) => {
  const { id, moduleName, index, data, used, beforeSrc } = relateData;
  const offerData = canvasContext.findInElements(id)?.attributes?.offerData;
  let beforeReplaceSrc = "";
  const src = used ? beforeSrc : data.src;

  if (offerData) {
    if (moduleName === "mainImage") {
      // 主图
      beforeReplaceSrc = offerData.images[index];
      offerData.images[index] = src;
    } else if (moduleName === "skuImage") {
      // sku图
      beforeReplaceSrc = offerData.skuProps[0].value[index].imageUrl;
      offerData.skuProps[0].value[index].imageUrl = src;
      // TODO：替换所有的sku明细里的图
    }

    canvasContext.updateElement(id, { attributes: { offerData } });
    return beforeReplaceSrc;
  }
};

// 反序列化方法
Element.fromJSON = (elementData: any) => {
  const attributes = elementData?.attributes || {};
  const offerData = elementData?.attributes?.offerData || {};
  const newOfferModuleSize = calcOfferInfoSize(offerData);
  const newWidth = newOfferModuleSize?.width || 0;
  const newHeight = newOfferModuleSize?.height || 0;
  return {
    ...elementData,
    width: newWidth,
    height: newHeight,
    attributes: {
      ...attributes,
      offerData: {
        ...offerData,
        width: newWidth,
        height: newHeight,
        _offerModuleSize: newOfferModuleSize,
      },
    },
  };
};

export default Element;
