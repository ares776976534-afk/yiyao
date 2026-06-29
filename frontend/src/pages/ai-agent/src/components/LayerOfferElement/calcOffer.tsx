import Yoga from "yoga-layout";
import calcText from "@/components/studio-canvas/utils/calcText";
import {
  calcRowContainer,
  calcMergeBlockModuleSize,
} from "@/components/studio-canvas/utils/calcContainer";
import { mergeAttributeValues } from "@/components/LayerOfferElement/utils";
import type { TypeNodeLayout } from "@/components/studio-canvas/types.d";
import { STATIC_STYLES, CALC_STYLES } from "./config";
import { $t } from "@/i18n";

export interface TypeSkuPropsItem {
  fid?: string;
  prop: string;
  value: {
    name: string;
    imageUrl?: string | null;
  }[];
}

export type TypeSkuProps = TypeSkuPropsItem[];

export type TypeProductAttribute = { attributeName: string; value: string }[];

interface TypeOfferInfoSize {
  width: number;
  height: number;
  children: {
    logo: TypeNodeLayout;
    title: TypeNodeLayout;
    mainImage: TypeNodeLayout;
    skuWithImage: TypeNodeLayout;
    skuWithOutImage: TypeNodeLayout;
    attributes: TypeNodeLayout;
  };
}

const defaultLabelModule = CALC_STYLES.labelModule;

const defaultTextModule = CALC_STYLES.textModule;

// 计算商品logo模块
export const calcOfferLogoSize = ({
  title = $t("global-1688-ai-app.LayerOfferElement.calcOffer.1rt", "1688商品"),
  logoWidth = STATIC_STYLES.logo.icon.width,
  logoHeight = STATIC_STYLES.logo.icon.height,
}: {
  title?: string;
  logoWidth?: number;
  logoHeight?: number;
} = {}): TypeNodeLayout => {
  const columnGap = STATIC_STYLES.logo.spacing;
  const moduleHeight = STATIC_STYLES.logo.text.height;
  const logoText = calcText({
    ...CALC_STYLES.logoModule,
    text: title,
  });

  return {
    x: 0,
    y: 0,
    width: logoText.width + logoWidth + columnGap,
    height: Math.max(moduleHeight, logoText.height, logoHeight),
  };
};

// 计算商品标题模块（标题名称 + 商品标题内容）
export const calcOfferTextSize = ({
  title = "",
  contentText = "",
}: { title?: string; contentText?: string } = {}): TypeNodeLayout => {
  const list = [
    calcText({
      ...defaultLabelModule,
      text: title,
    }),
    calcText({
      ...defaultTextModule,
      text: contentText,
    }),
  ];

  return calcMergeBlockModuleSize(list, STATIC_STYLES.layout.rowGap);
};

// 计算商品主图模块
export const calcOfferMainImageSize = ({
  title = "",
  imageList = [],
}: { title?: string; imageList?: string[] } = {}): TypeNodeLayout => {
  const labelModule = {
    ...defaultLabelModule,
    text: title,
  };
  const itemModule = CALC_STYLES.offerMainImageModule;

  const list = [
    calcText(labelModule),
    calcRowContainer(itemModule, imageList.length),
  ];

  return calcMergeBlockModuleSize(list, STATIC_STYLES.layout.rowGap);
};

// 计算商品SKU模块
export const calcOfferSkuSize = (
  skuProps: TypeSkuProps = []
): TypeNodeLayout => {
  const moduleList: any[] = [];
  const skuWithImage = {
    width: 560,
    minHeight: 20,
    padding: 12,
    itemWidth: 268,
    itemHeight: 116,
    rowGap: 0,
    columnGap: 0,
    radius: 6,
  };

  const skuWithoutImage = {
    width: 560,
    minHeight: 20,
    padding: 12,
    itemWidth: 536,
    itemHeight: 36,
    rowGap: 0,
    columnGap: 0,
    radius: 6,
  };

  skuProps?.forEach((skuItem, i) => {
    const labelModule = {
      ...defaultLabelModule,
      text: skuItem.prop,
    };

    // 一维SKU一排二，二维SKU一排一宽度不一样
    const itemModule = i === 0 ? skuWithImage : skuWithoutImage;

    moduleList.push(
      calcMergeBlockModuleSize(
        [
          calcText(labelModule),
          calcRowContainer(itemModule, skuItem.value.length),
        ],
        STATIC_STYLES.layout.rowGap
      )
    );
  });

  return calcMergeBlockModuleSize(moduleList, STATIC_STYLES.layout.blockRowGap);
};

// 计算有图sku模块
export const calcOfferSkuWithImageSize = (skuItem: TypeSkuPropsItem) => {
  const labelModule = {
    ...defaultLabelModule,
    text: skuItem.prop,
  };

  const itemModule = CALC_STYLES.offerSkuWithImageModule;

  const blockSize = calcMergeBlockModuleSize(
    [calcText(labelModule), calcRowContainer(itemModule, skuItem.value.length)],
    STATIC_STYLES.layout.rowGap
  );

  return blockSize;
};

// 计算无图sku模块
export const calcOfferSkuWithoutImageSize = (skuItem: TypeSkuPropsItem) => {
  const STYLES = STATIC_STYLES.skuWithOutImageGrid;
  const root = Yoga.Node.create();
  root.setWidth(STYLES.width);
  root.setHeight("auto");
  root.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  root.setFlexWrap(Yoga.WRAP_WRAP);
  root.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
  root.setAlignItems(Yoga.ALIGN_FLEX_START);
  // 同时设置行间距和列间距
  root.setGap(Yoga.GUTTER_ALL, STYLES.gap);
  // 所有方向设置相同的padding
  root.setPadding(Yoga.EDGE_ALL, STYLES.padding);
  const labelModule = {
    ...defaultLabelModule,
    text: skuItem.prop,
  };

  const itemModule = STYLES.item;

  const nodes: any = [];

  skuItem?.value?.forEach((item, i) => {
    const itemSize = calcText({
      ...itemModule,
      text: item.name,
    });
    const node = Yoga.Node.create();
    node.setWidth(itemSize.width);
    node.setHeight(itemSize.height);
    root.insertChild(node, i);
    nodes.push(node);
  });

  root.calculateLayout(STYLES.width, "auto", Yoga.DIRECTION_LTR);

  const layout = root.getComputedLayout();

  const blockSize = calcMergeBlockModuleSize(
    [
      calcText(labelModule),
      {
        width: layout.width,
        height: layout.height,
        flatItems: nodes.map((node) => {
          const item = node.getComputedLayout();
          return {
            x: item.left,
            y: item.top,
            width: item.width,
            height: item.height,
          };
        }),
      },
    ],
    STATIC_STYLES.layout.rowGap
  );

  return blockSize;
};

// 计算商品属性模块
export const calcOfferAttributesSize = (
  _productAttribute: TypeProductAttribute = []
): TypeNodeLayout => {
  const productAttribute = mergeAttributeValues(_productAttribute);
  const containerPadding = 12;

  const labelModule = calcText({
    ...defaultLabelModule,
    text: $t(
      "global-1688-ai-app.LayerOfferElement.calcOffer.attribute",
      "商品属性"
    ),
  });

  const labelConfig = CALC_STYLES.offerAttributesModule;

  const moduleList = productAttribute.map((attribute, i) => {
    const nameModule = calcText({
      ...labelConfig,
      text: attribute.attributeName,
    });

    const valueModule = calcText({
      ...labelConfig,
      text: attribute.value,
    });

    const height = Math.max(nameModule.height, valueModule.height);

    nameModule.height = height;
    valueModule.height = height;
    valueModule.x = nameModule.width;

    return {
      x: 0,
      y: 0,
      width: 536,
      height,
      children: [nameModule, valueModule],
    };
  });

  const attributesSize = calcMergeBlockModuleSize(moduleList, 1);
  attributesSize.height += containerPadding * 2;

  const blockSize = calcMergeBlockModuleSize(
    [labelModule, attributesSize],
    STATIC_STYLES.layout.rowGap
  );

  return {
    ...blockSize,
    width: 560,
  };
};

// 计算文本列表模块
export const calcOfferTextListSize = ({
  title = "",
  contentText = [],
  textIndent = 20,
}: {
  title?: string;
  contentText?: string[];
  textIndent?: number;
} = {}): TypeNodeLayout => {
  // 多行文本
  const moduleList = contentText?.map((text, index) => {
    const itemSize = calcText({
      ...defaultTextModule,
      x: textIndent,
      width: defaultTextModule.width - textIndent,
      text: text,
    });

    return itemSize;
  });

  const list = [
    calcText({
      ...defaultLabelModule,
      text: title,
    }),
    calcMergeBlockModuleSize(moduleList, 2),
  ];

  return calcMergeBlockModuleSize(list, STATIC_STYLES.layout.rowGap);
};

// 计算折叠模块
export const calcCollapseComponentSize = ({
  text = $t(
    "global-1688-ai-app.LayerOfferElement.calcOffer.viewqb",
    "查看全部"
  ),
}: {
  text?: string;
} = {}) => {
  const STYLES = STATIC_STYLES.collapseComponent;

  const textSize = calcText({
    fontSize: STYLES.text.fontSize,
    lineHeight: STYLES.text.lineHeight,
    text: text,
    paddingTop: STYLES.paddingTop,
    paddingBottom: STYLES.paddingBottom,
  });

  const totalWidth =
    STYLES.paddingLeft +
    STYLES.icon.width +
    STYLES.iconTextSpacing +
    textSize.width +
    STYLES.paddingRight;
  const contentHeight = Math.max(STYLES.icon.height, textSize.height);

  return {
    x: 0,
    y: 0,
    width: totalWidth,
    height: contentHeight,
    contentY: textSize.contentY,
  };
};

export const updateLayerOfferText = (relateData, canvasContext) => {
  const { id, moduleName, value, index } = relateData;
  const offerData =
    canvasContext?.findInElements?.(id)?.attributes?.offerData || {};

  if (moduleName === "skuProps") {
    const prop = offerData?.skuProps?.[index]?.prop;
    const originalValues = offerData?.skuProps?.[index]?.value || [];
    // 同步更新 skuProps 和 productSkuInfos
    // skuProps 用 originName 保存原始值，productSkuInfos 用 originValue 保存原始值
    value?.forEach((item, i) => {
      const oldItem = originalValues[i];
      // skuProps: 首次修改时记录 originName
      if (!item.originName) {
        item.originName = oldItem?.name;
      }
      const originName = item.originName;
      
      // productSkuInfos: 同步修改对应的 skuAttributes
      offerData?.productSkuInfos?.forEach((skuInfo) => {
        skuInfo?.skuAttributes?.forEach((attr) => {
          if (attr.attributeName === prop) {
            // 获取 attr 的原始值：有 originValue 用它，没有说明还没改过，value 就是原始值
            const attrOriginValue = attr.originValue ?? attr.value;
            if (attrOriginValue === originName) {
              // 首次修改时记录 originValue
              if (!attr.originValue) {
                attr.originValue = attr.value;
              }
              attr.value = item.name;
            }
          }
        });
      });
    });
    if (offerData?.skuProps?.[index]) {
      offerData.skuProps[index].value = value;
    }
  } else {
    offerData[moduleName] = value;
  }
  const _offerModuleSize = calcOfferInfoSize(offerData);
  offerData._offerModuleSize = _offerModuleSize;
  canvasContext?.updateElement?.(id, { attributes: { offerData } });
};

// 计算商品总和
export const calcOfferInfoSize = (offerData: any = {}): TypeOfferInfoSize => {
  const paddingTop = STATIC_STYLES.card.padding;
  const paddingBottom = STATIC_STYLES.card.padding;
  const rowGap = STATIC_STYLES.layout.blockRowGap;
  const colGap = STATIC_STYLES.layout.groupSpacing;

  const logoSize = calcOfferLogoSize({
    title: $t("global-1688-ai-app.LayerOfferElement.calcOffer.1rt", "1688商品"),
  });
  const titleSize = calcOfferTextSize({
    title: $t(
      "global-1688-ai-app.LayerOfferElement.calcOffer.productTitle",
      "商品标题"
    ),
    contentText: offerData.title,
  });
  const mainImageSize = calcOfferMainImageSize({
    title: $t(
      "global-1688-ai-app.LayerOfferElement.calcOffer.productzt",
      "商品主图"
    ),
    imageList: offerData.images,
  });

  // 以下属性不是所有商品都有，没有的属性不显示
  const emptyModule = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  // 新的布局有图sku在左侧，无图sku在右侧，所以进行拆分
  const skuWithImageSize = offerData.skuProps?.[0]
    ? calcOfferSkuWithImageSize(offerData.skuProps[0])
    : { ...emptyModule };
  const skuWithOutImageSize = offerData.skuProps?.[1]
    ? calcOfferSkuWithoutImageSize(offerData.skuProps[1])
    : { ...emptyModule };
  // 关键词模块
  const keywords = offerData.keywords?.join(",");
  const keywordsSize = keywords
    ? calcOfferTextSize({
        title: $t(
          "global-1688-ai-app.LayerOfferElement.calcOffer.keyword",
          "关键词"
        ),
        contentText: keywords,
      })
    : { ...emptyModule };

  const attributesSize = offerData.productAttribute
    ? calcOfferAttributesSize(offerData.productAttribute)
    : { ...emptyModule };

  // 五点详描模块
  const sellingPointsSize = offerData.sellingPoints?.length
    ? calcOfferTextListSize({
        title: $t(
          "global-1688-ai-app.LayerOfferElement.calcOffer.wdxm",
          "五点详描"
        ),
        contentText: offerData.sellingPoints,
        textIndent: 20,
      })
    : { ...emptyModule };

  // 商品描述模块
  const descriptionSize = offerData.description
    ? calcOfferTextSize({
        title: $t(
          "global-1688-ai-app.LayerOfferElement.calcOffer.productDescription",
          "商品描述"
        ),
        contentText: offerData.description,
      })
    : { ...emptyModule };

  const maxLeftWidth = Math.max(
    mainImageSize.width || 0,
    skuWithImageSize.width || 0
  );
  const rightGroups = [
    titleSize,
    keywordsSize,
    skuWithOutImageSize,
    sellingPointsSize,
    attributesSize,
    descriptionSize,
  ].filter((item) => item);
  const maxRightWidth = Math.max(...rightGroups.map((item) => item.width || 0));
  rightGroups.forEach((item) => {
    item.x = maxLeftWidth + colGap;
  });

  // 左右模块 + 左右padding + 中间间距
  const width = maxLeftWidth + maxRightWidth + colGap * 3;

  // 按照模块顺序计算位置，顺序很重要
  const leftSize = calcMergeBlockModuleSize(
    [logoSize, mainImageSize, skuWithImageSize],
    rowGap
  );
  const rightSize = calcMergeBlockModuleSize(
    [logoSize, ...rightGroups],
    rowGap
  );
  let totalSize =
    Math.max(leftSize.height, rightSize.height) + paddingTop + paddingBottom;

  if (totalSize > STATIC_STYLES.card.maxHeight) {
    // 超过最大高度，需要加上折叠按钮的安全距离
    totalSize +=
      STATIC_STYLES.expandCollapseIcon.height + STATIC_STYLES.card.padding;
  }

  const OfferInfoSize = {
    width,
    height: totalSize,
    children: {
      logo: logoSize,
      // 左侧
      mainImage: mainImageSize,
      skuWithImage: skuWithImageSize,
      // 右侧
      title: titleSize,
      keywords: keywordsSize,
      skuWithOutImage: skuWithOutImageSize,
      attributes: attributesSize,
      sellingPoints: sellingPointsSize,
      description: descriptionSize,
    },
  };

  return OfferInfoSize;
};
