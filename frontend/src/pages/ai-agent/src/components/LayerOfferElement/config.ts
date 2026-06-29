import theme from "@/components/studio-canvas/theme";
import { $t } from "@/i18n";
export const VERTICAL = "vertical"; // 纵向
export const HORIZONTAL = "horizontal"; // 横向

/**
 * 将逗号分隔的字符串转换为数组
 * @param themeVarValue - 逗号分隔的字符串值
 * @returns 字符串数组
 * @example
 * getThemeVarAsArray('0, #1B1B1B00, 0.59, #1B1B1B')
 * // 返回: ['0', '#1B1B1B00', '0.59', '#1B1B1B']
 */
export const getThemeVarAsArray = (themeVarValue: string): string[] => {
  if (!themeVarValue) {
    return [];
  }

  return themeVarValue.split(",").map((part) => part.trim());
};

export const STATIC_STYLES = {
  // 布局间距
  layout: {
    groupSpacing: 20, // 组之间的间距
    rowGap: 8, // 标题与内容的间距
    blockRowGap: 20, // 大区域之间的间距
  },

  distributeMode: {
    icon: {
      size: 32,
    },
  },

  // 卡片背景
  cardRect: {
    strokeWidth: 2,
    dash: [8, 8], // 模拟dash虚线，第一项定义虚线长度，第二项定义虚线间距
  },

  // 卡片容器
  card: {
    maxHeight: 980, // 容器最大高度
    padding: 20, // 内边距
    cornerRadius: 16, // 圆角
  },

  // Logo区域
  logo: {
    icon: {
      width: 28,
      height: 28,
      cornerRadius: 4,
    },
    text: {
      width: 520,
      height: 26,
      text: $t("global-1688-ai-app.LayerOfferElement.1rt", "1688商品"),
      fontSize: 18,
      fontStyle: "bold",
      verticalAlign: "middle",
    },
    spacing: 4, // Logo图标与文字间距
  },

  // 区域标题背景样式（商品信息、商品主图、颜色等）
  sectionLabelBackground: {
    height: 28,
    padding: 8,
    strokeWidth: 1,
    cornerRadius: 4,
  },

  // 区域标题文字样式
  sectionLabel: {
    height: 20,
    fontSize: 14,
    verticalAlign: "middle",
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    lineHeight: 20 / 14,
    fontStyle: "500",
  },

  // 普通内容文字样式
  contentText: {
    width: 536,
    fontSize: 14,
    lineHeight: 20 / 14,
    verticalAlign: "middle",
  },

  // 商品标题背景样式
  offerTitleBackground: {
    height: 44,
    padding: 12,
    cornerRadius: 6,
  },

  // 图片区域背景样式
  imageBackground: {
    padding: 12,
    skuPadding: 8, // SKU图片区域的内边距
    cornerRadius: 6,
  },

  // 主图片网格样式
  mainImageGrid: {
    itemWidth: 100, // 图片基础宽度
    itemHeight: 100, // 图片基础高度
    spacing: 8, // 图片间距
    imagesPerRow: 10,
  },

  // SKU图片网格样式
  skuImageGrid: {
    itemWidth: 100, // 图片基础宽度
    itemHeight: 100, // 图片基础高度
    spacing: 16, // 图片间距
    imagesPerRow: 2, // 每行图片数量
    skuRectSpacing: 8, // 边框与图片的间距
    textSpacing: 16, // 图片与文字的间距
    textMaxWidth: 136, // 文字最大宽度
  },

  skuWithOutImageGrid: {
    width: 560,
    gap: 8,
    padding: 12,
    item: {
      minHeight: 20,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 8,
      paddingBottom: 8,
      borderWidth: 1,
      radius: 6,
      fontSize: 14,
      lineHeight: 20 / 14,
    },
  },

  // 图片边框样式
  imageRect: {
    strokeWidth: 1,
    cornerRadius: 4,
  },

  // 折叠 / 展开按钮
  expandCollapseIcon: {
    width: 32,
    height: 32,
  },

  // 折叠/展开组件样式
  collapseComponent: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    iconTextSpacing: 4, // 箭头和文字间隔
    icon: {
      width: 16,
      height: 16,
    },
    text: {
      fontSize: 14,
      lineHeight: 20 / 14,
      verticalAlign: "middle",
    },
    linearGradient: {
      height: 152,
    },
    cornerRadius: 8,
    bgFill: "#fff",
    fill: "#000",
  },
};

export const CALC_STYLES = {
  labelModule: {
    minHeight: 24,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    // borderWidth: 1,
    radius: 4,
    fontSize: STATIC_STYLES.sectionLabel.fontSize,
    lineHeight: STATIC_STYLES.sectionLabel.lineHeight,
  },
  textModule: {
    width: 560,
    minHeight: 44,
    padding: 12,
    radius: 6,
    fontSize: STATIC_STYLES.contentText.fontSize,
    lineHeight: STATIC_STYLES.contentText.lineHeight,
  },
  logoModule: {
    width: 520,
    fontSize: STATIC_STYLES.logo.text.fontSize,
  },
  offerMainImageModule: {
    width: 560,
    minHeight: 20,
    padding: 12,
    itemWidth: 100,
    itemHeight: 100,
    rowGap: STATIC_STYLES.mainImageGrid.spacing,
    columnGap: STATIC_STYLES.mainImageGrid.spacing,
    radius: 6,
  },
  offerSkuWithImageModule: {
    width: 560,
    minHeight: 20,
    padding: 12,
    itemWidth: 268,
    itemHeight: 116,
    rowGap: 0,
    columnGap: 0,
    radius: 6,
  },
  offerAttributesModule: {
    width: 268,
    minHeight: 20,
    padding: 8,
    borderWidth: 1,
    fontSize: STATIC_STYLES.contentText.fontSize,
    lineHeight: STATIC_STYLES.contentText.lineHeight,
  },
};

export const getThemeStyles = () => {
  return {
    cardRect: {
      fill: theme.var("--canvas-offer-bg"),
    },
    logo: {
      text: {
        text: $t("global-1688-ai-app.LayerOfferElement.1rt", "1688商品"),
        fill: theme.var("--canvas-offer-color"),
      },
    },
    sectionLabelBackground: {
      fill: theme.var("--canvas-offer-section-label-bg"),
    },
    sectionLabel: {
      fill: theme.var("--canvas-offer-color"),
    },
    contentText: {
      fill: theme.var("--canvas-offer-color"),
    },
    offerTitleBackground: {
      fill: theme.var("--canvas-offer-section-label-bg"),
    },
    imageBackground: {
      fill: theme.var("--canvas-offer-section-label-bg"),
    },
    imageRect: {
      stroke: theme.var("--canvas-offer-sku-item-border-color"),
    },
    collapseComponent: {
      linearGradient: {
        colorStops: getThemeVarAsArray(
          theme.var("--canvas-offer-sku-collapse-linear-gradient"),
        ),
      },
    },
  };
};

export const getComputedStyle = () => {
  const themeStyles = getThemeStyles();

  return {
    ...STATIC_STYLES,
    logo: {
      ...STATIC_STYLES.logo,
      text: {
        ...STATIC_STYLES.logo.text,
        ...themeStyles.logo.text,
      },
    },
    sectionLabelBackground: {
      ...STATIC_STYLES.sectionLabelBackground,
      ...themeStyles.sectionLabelBackground,
    },
    sectionLabel: {
      ...STATIC_STYLES.sectionLabel,
      ...themeStyles.sectionLabel,
    },
    contentText: {
      ...STATIC_STYLES.contentText,
      ...themeStyles.contentText,
    },
    offerTitleBackground: {
      ...STATIC_STYLES.offerTitleBackground,
      ...themeStyles.offerTitleBackground,
    },
    imageBackground: {
      ...STATIC_STYLES.imageBackground,
      ...themeStyles.imageBackground,
    },
    imageRect: {
      ...STATIC_STYLES.imageRect,
      ...themeStyles.imageRect,
    },
    collapseComponent: {
      ...STATIC_STYLES.collapseComponent,
      linearGradient: {
        ...STATIC_STYLES.collapseComponent.linearGradient,
        ...themeStyles.collapseComponent.linearGradient,
      },
    },
  };
};
