import { useRef, useState } from "react";
import Konva from "konva";
import { getComputedStyle } from "../config";
import { mergeAttributeValues } from "../utils";
import type { EnumEditeState, UseOfferElementProps } from "../types.d";

export function useOfferElement({ offerData }: UseOfferElementProps) {
  const STYLES = getComputedStyle();
  // 获取模块尺寸
  const _offerModuleSize = offerData._offerModuleSize || {};
  const _modules = _offerModuleSize?.children || {};
  // 计算卡片总尺寸 - 使用静态计算的内容尺寸
  const totalWidth = _offerModuleSize.width || 0;
  const totalHeight = _offerModuleSize.height || 0;

  // state
  const [editState, setEditState] = useState<EnumEditeState | null>(null);
  const [editBatchIds, setEditBatchIds] = useState<string[]>();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    totalHeight > STYLES.card.maxHeight,
  );
  // Refs
  const groupRef = useRef<Konva.Group>(null);
  const loadingTextRef = useRef<Konva.Text>(null);
  const loadingMaskRef = useRef<Konva.Group>(null);

  // 获取文本宽度
  const loadingTextWidth = loadingTextRef.current?.getWidth() || 0;

  const attributes = mergeAttributeValues(offerData.productAttribute || []);

  // 过滤有图片的SKU
  const skuWithImage = offerData.skuProps?.[0];

  // 过滤没有图片的SKU
  const skuWithoutImage = offerData.skuProps?.[1];

  // 主图图片数组
  const mainImages = offerData.images || [];

  // 为skuWithImage添加image对象和计算尺寸
  const skuWithImageHooks = {
    prop: skuWithImage?.prop,
    value:
      skuWithImage?.value?.map?.(
        (item: { name: string; imageUrl: string }, index: number) => {
          const refKey = `${item.name}-${index}`;

          // 计算当前SKU图片的尺寸
          let imageSize = {
            width: STYLES.skuImageGrid.itemWidth,
            height: STYLES.skuImageGrid.itemHeight,
          };

          return {
            ...item,
            image: item.imageUrl,
            imageSize,
            refKey, // 添加refKey用于标识
          };
        },
      ) || [],
  };

  // 为skuWithoutImage添加refKey
  const skuWithoutImageHooks = {
    prop: skuWithoutImage?.prop,
    value:
      skuWithoutImage?.value?.map?.((item: { name: string }, index: number) => {
        const refKey = `${item.name}-${index}`;
        return {
          ...item,
          refKey,
        };
      }) || [],
  };

  // 检查图片加载状态
  const allMainImagesLoaded = true;
  const allSkuImagesLoaded = true;
  // 检查三个图标的加载状态
  const allIconsLoaded = true;
  const allImagesLoaded =
    allMainImagesLoaded && allSkuImagesLoaded && allIconsLoaded;

  // 计算logo区域尺寸
  const logoHeight = STYLES.logo.icon.height;

  // 计算最终的内容宽度
  const contentWidth = _offerModuleSize.width;

  // 纵向布局：计算各区域位置
  const fixedPos = STYLES.card.padding;

  // logo位置
  const logoPosition = {
    x: fixedPos,
    y: STYLES.card.padding + _modules?.logo?.y || 0,
  };

  // 主图位置
  const mainImagePosition = {
    x: fixedPos,
    y: STYLES.card.padding + _modules?.mainImage?.y || 0,
  };

  // 有图sku位置
  const skuWithImageModules = _modules?.skuWithImage?.children || [];
  const skuWithOutImageModules = _modules?.skuWithOutImage?.children || [];

  const skuWithImagePosition = {
    x: fixedPos,
    y:
      STYLES.card.padding +
      (_modules?.skuWithImage?.y || 0) +
      (skuWithImageModules?.[0]?.y || 0),
  };

  // 标题位置
  const titlePosition = {
    x: fixedPos + _modules?.title?.x || 0,
    y: STYLES.card.padding + _modules?.title?.y || 0,
  };

  // 关键词位置
  const keywordsPosition = {
    x: fixedPos + _modules?.keywords?.x || 0,
    y: STYLES.card.padding + _modules?.keywords?.y || 0,
  };

  // 五点详描位置
  const sellingPointsPosition = {
    x: fixedPos + _modules?.sellingPoints?.x || 0,
    y: STYLES.card.padding + _modules?.sellingPoints?.y || 0,
  };

  // 商品描述位置
  const descriptionPosition = {
    x: fixedPos + _modules?.description?.x || 0,
    y: STYLES.card.padding + _modules?.description?.y || 0,
  };

  // 无图sku位置
  const skuWithoutImagePosition = {
    x: fixedPos + _modules?.skuWithOutImage?.x || 0,
    y:
      STYLES.card.padding +
      (_modules?.skuWithOutImage?.y || 0) +
      (skuWithOutImageModules?.[0]?.y || 0),
  };

  // 属性位置
  const attributesPosition = {
    x: fixedPos + _modules?.attributes?.x || 0,
    y: STYLES.card.padding + (_modules?.attributes?.y || 0),
  };

  return {
    state: {
      editState,
      editBatchIds,
      isCollapsed,
    },
    // Refs
    refs: {
      groupRef,
      loadingTextRef,
      loadingMaskRef,
    },
    // 文本宽度
    textWidths: {
      loadingTextWidth,
    },
    // 数据
    data: {
      attributes,
      skuWithImage: skuWithImageHooks,
      skuWithoutImage: skuWithoutImageHooks,
      mainImages,
      allImagesLoaded,
    },
    // 尺寸
    dimensions: {
      contentWidth,
      totalWidth,
      totalHeight,
      logoHeight,
    },
    // 位置
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
  };
}
