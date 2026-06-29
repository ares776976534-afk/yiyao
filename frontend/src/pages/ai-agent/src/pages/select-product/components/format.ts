import { STREAMING_SPEEDS } from "../config";
import {
  ProductReport,
  Text,
  KeywordButton,
  Brief,
  NormalProductList,
  NewProductList,
  HotSaleProductList,
  ComparedProductList,
  KeywordsCard,
  IconText,
  TaskPlanning,
} from "./LeftComponents";
import {
  ComparedProductTable,
  HotSaleProductTable,
  KeywordAmazonTable,
  KeywordGoogleTable,
  NewProductTable,
  NormalProductTable,
  ProductReportBoard,
  CategoryTikTokTable,
  CateGoogleTable,
  ModifyFormCard,
  TooltipComponent,
} from "./RightComponents";
import { ImproveKeywordAmazonTable } from "../components/ImproveComponents";
import { $t } from "@/i18n";
import { LOG_KEYS } from "@/utils/logConfig";

// 转换接口热销商品数据为组件详情数据
const convertToDetailData = (record: any, is1688Compare = false) => {
  return [
    // 分类信息行
    {
      key: "category",
      image: "",
      similarCount: 0,
      topProduct: { title: "", link: "" },
      launchDate: "",
      priceRange: "",
      ratingRange: "",
      monthlySales: { count: "", growth: "", isPositive: true },
      isCategory: true,
      is1688Compare,
      categoryInfo: record?.catePath,
      riskStatus: record?.riskStatus,
      productUrl: record?.productUrl,
    },
    // 主商品数据
    {
      key: "main-product",
      image: record?.mainImgUrl,
      similarCount: record?.spItemCnt,
      topProduct: {
        title: record?.title,
        link: record?.productUrl,
      },
      launchDate: record?.onShelfDate,
      priceRange: record?.priceRange,
      ratingRange: record?.ratingRange,
      monthlySales: {
        count: record?.soldCnt30d,
        growth: record?.soldCnt30dMom?.value,
        direction: record?.soldCnt30dMom?.direction,
      },
      platform: record?.platform,
      region: record?.region,
      spId: record?.spInfo?.spId,
      riskStatus: record?.riskStatus,
      productUrl: record?.productUrl,
    },
    // Top5热销品标题行
    {
      key: "top-products-title",
      image: "",
      similarCount: 0,
      topProduct: { title: "", link: "" },
      launchDate: "",
      priceRange: "",
      ratingRange: "",
      monthlySales: { count: "", growth: "", isPositive: true },
      isTopProducts: true,
      is1688Compare,
      riskStatus: record?.riskStatus,
      productUrl: record?.productUrl,
    },
    // 热销商品列表
    ...record?.sameCateHotSaleList?.map((item: any, index: number) => ({
      key: `hot-product-${index + 1}`,
      image: item?.mainImgUrl,
      similarCount: item?.spItemCnt,
      topProduct: { title: item?.title, link: item?.productUrl },
      launchDate: item?.onShelfDate,
      priceRange: item?.priceRange,
      ratingRange: item?.ratingRange,
      monthlySales: {
        count: item?.soldCnt30d,
        growth: item?.soldCnt30dMom?.value,
        direction: item?.soldCnt30dMom?.direction,
      },
      platform: item?.platform,
      region: item?.region,
      spId: item?.spInfo?.spId,
      riskStatus: item?.riskStatus,
      productUrl: item?.productUrl,
    })),
  ];
};

export const MODULE_FORMAT = (data: any) => {
  if (data?.cardType === "MODULE") {
    return {
      ...data,
      accordionContent: [],
    };
  }
  return null;
};

export const MARKDOWN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === "MARKDOWN_TEXT") {
    return {
      ...data,
      cardType: "MARKDOWN_TEXT",
      text: data?.markdownContent,
      chunkIntervalMs: STREAMING_SPEEDS.NORMAL,
      streamGranularity: "char",
      LeftComponent: TaskPlanning,
    };
  }
  return null;
};

export const PRODUCT_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    switch (data?.cardSubType) {
      // 左侧暂时不使用这个卡片
      case "KEYWORD_SELECT_CARD":
        return {
          ...data,
          LeftComponent: data?.isNotShow ? "" : KeywordButton,
          RightComponent: KeywordAmazonTable,
          logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.KEYWORD_SELECT_CARD,
        };
      case "KEYWORD_GOOGLE_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: KeywordGoogleTable,
          logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.KEYWORD_GOOGLE_TRENDS,
        };
      case "CATE_GOOGLE_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CateGoogleTable,
          logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.CATE_GOOGLE_TRENDS,
        };
      // 左侧暂时不使用这个卡片
      case "CATE_SELECT_CARD":
        return {
          ...data,
          LeftComponent: data?.isNotShow ? "" : KeywordButton,
          RightComponent: CategoryTikTokTable,
          logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.CATE_SELECT_CARD,
        };
      default:
        return null;
    }
  }
  return null;
};

export const NORMAL_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "NORMAL_PRODUCT") {
      return {
        ...data,
        cardType: "NORMAL_PRODUCT",
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.valuegtk",
                  `${item?.spItemCnt}个同款`,
                  [item?.spItemCnt]
                ),
                value: item?.spItemCnt,
              },
            ],
          };
        }),
        LeftComponent: NormalProductList,
        RightComponent: NormalProductTable,
        logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.NORMAL_PRODUCT,
        imgClickLogKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.ITEMLIST_IMGCLICK,
      };
    }
    return null;
  }
  return null;
};

const NEW_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "NEW_PRODUCT") {
      return {
        ...data,
        cardType: "NEW_PRODUCT",
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.valuegtk",
                  `${item?.spItemCnt}个同款`,
                  [item?.spItemCnt]
                ),
                value: item?.spItemCnt,
              },
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.sjvalueday",
                  `上架${item?.onShelfDays}天`,
                  [item?.onShelfDays]
                ),
                value: item?.onShelfDays,
              },
            ],
            bottomContent: $t(
              "global-1688-ai-app.select-product.format.nrj",
              `新品机会分：${item?.newProductOppScore}`,
              [item?.newProductOppScore]
            ),
          };
        }),
        LeftComponent: NewProductList,
        RightComponent: NewProductTable,
        logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.NEW_PRODUCT,
        imgClickLogKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.ITEMLIST_IMGCLICK,
      };
    }
    return null;
  }
  return null;
};

const HOT_SALE_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "HOT_SALE_PRODUCT") {
      return {
        ...data,
        cardType: "HOT_SALE_PRODUCT",
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.valuegtk",
                  `${item?.spItemCnt}个同款`,
                  [item?.spItemCnt]
                ),
                value: item?.spItemCnt,
              },
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.sjvalueday",
                  `上架${item?.onShelfDays}天`,
                  [item?.onShelfDays]
                ),
                value: item?.onShelfDays,
              },
            ],
            detailData: convertToDetailData(item),
          };
        }),
        LeftComponent: HotSaleProductList,
        RightComponent: HotSaleProductTable,
        logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.HOT_SALE_PRODUCT,
        logKeyHotDetail: LOG_KEYS.NEW_PRODUCT_AGENT.LP.HOT_DETAIL,
        imgClickLogKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.ITEMLIST_IMGCLICK,
      };
    }
    return null;
  }
  return null;
};

export const COMPARED_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "COMPARED_PRODUCT") {
      return {
        ...data,
        cardType: "COMPARED_PRODUCT",
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.valuegtk",
                  `${item?.spItemCnt}个同款`,
                  [item?.spItemCnt]
                ),
                value: item?.spItemCnt,
              },
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.sjvalueday",
                  `上架${item?.onShelfDays}天`,
                  [item?.onShelfDays]
                ),
                value: item?.onShelfDays,
              },
            ],
            detailData: convertToDetailData(item),
          };
        }),
        LeftComponent: ComparedProductList,
        RightComponent: ComparedProductTable,
        logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.COMPARED_PRODUCT,
        logKeyComparedDetail: LOG_KEYS.NEW_PRODUCT_AGENT.LP.COMPARED_DETAIL,
        imgClickLogKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.ITEMLIST_IMGCLICK,
      };
    }
    return null;
  }
  return null;
};

export const OD_COMPARE_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "OD_COMPARE_PRODUCT") {
      return {
        ...data,
        cardType: "COMPARED_PRODUCT",
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.sjvalueday",
                  `上架${item?.onShelfDays}天`,
                  [item?.onShelfDays]
                ),
                value: item?.onShelfDays,
              },
            ],
            detailData: convertToDetailData(item, true),
          };
        }),
        LeftComponent: ComparedProductList,
        RightComponent: ComparedProductTable,
        logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.COMPARED_PRODUCT,
        logKeyComparedDetail: LOG_KEYS.NEW_PRODUCT_AGENT.LP.COMPARED_DETAIL,
        imgClickLogKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.ITEMLIST_IMGCLICK,
      };
    }
    return null;
  }
  return null;
};

export const TASK_EXECUTION_BRIEF_FORMAT = (data: any) => {
  if (data?.cardType === "TASK_EXECUTION_BRIEF") {
    return {
      ...data,
      LeftComponent: Brief,
    };
  }
  return null;
};

export const KEYWORD_SUMMARY_FORMAT = (data: any) => {
  if (data?.cardType === "KEYWORD_SUMMARY") {
    return {
      ...data,
    };
  }
  return null;
};

export const PLAIN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === "PLAIN_TEXT") {
    return {
      ...data,
      LeftComponent: Text,
    };
  }
  return null;
};

export const ICON_TITLE_CARD = (data: any) => {
  if (data?.cardType === "ICON_TITLE_CARD") {
    return {
      ...data,
      LeftComponent: IconText,
    };
  }
  return null;
};

const searchInItems = (
  items: any[],
  taskId: string,
  cardType: string,
  matchTaskId: boolean,
  cardSubType?: string,
): any => {
  for (const item of items) {
    const match = matchTaskId
      ? item?.taskId === taskId &&
        item?.cardType === cardType &&
        (!cardSubType || item.cardSubType === cardSubType)
      : item?.cardType === cardType &&
        (!cardSubType || item.cardSubType === cardSubType);
    if (match) return item;
    if (item?.groupContent?.length) {
      const found = searchInItems(item.groupContent, taskId, cardType, matchTaskId, cardSubType);
      if (found) return found;
    }
  }
  return null;
};

export const findContentItem = (
  blocks: any[],
  taskId: string,
  cardType: string,
  cardSubType?: string
) => {
  if (taskId) {
    for (const block of blocks) {
      if (
        block?.taskId === taskId &&
        block?.cardType === cardType &&
        (!cardSubType || block.cardSubType === cardSubType)
      ) {
        return block;
      }
      if (block?.accordionContent?.length) {
        const found = searchInItems(block.accordionContent, taskId, cardType, true, cardSubType);
        if (found) return found;
      }
    }
  }

  for (const block of blocks) {
    if (
      block?.cardType === cardType &&
      (!cardSubType || block.cardSubType === cardSubType)
    ) {
      return block;
    }
    if (block?.accordionContent?.length) {
      const found = searchInItems(block.accordionContent, taskId, cardType, false, cardSubType);
      if (found) return found;
    }
  }
  return null;
};

// let keywordListCache = [];
/** ************ 选品报告 ************* */
export const PRODUCT_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === "REPORT_CARD") {
    const amazonKeywordData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "KEYWORD_SELECT_CARD"
    );
    const googleKeywordData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "KEYWORD_GOOGLE_TRENDS"
    );
    const cateGoogleData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "CATE_GOOGLE_TRENDS"
    );

    const googleData = googleKeywordData || cateGoogleData;

    const comparedProductData = findContentItem(
      blocks,
      data.taskId,
      "COMPARED_PRODUCT"
    );
    const keywordSummaryData = findContentItem(
      blocks,
      data.taskId,
      "KEYWORD_SUMMARY"
    );
    const categoryTikTokData = findContentItem(
      blocks,
      data.taskId,
      "BUTTON",
      "CATE_SELECT_CARD"
    );

    const keywordList =
      amazonKeywordData?.keywordList || categoryTikTokData?.keywordList || [];
    const defaultShowKeyword =
      amazonKeywordData?.defaultShowKeyword ||
      categoryTikTokData?.defaultShowKeyword ||
      "";

    return {
      ...data,
      itemBtn: data?.reportTags?.map((item: any) => {
        return {
          key: item,
          value: item,
        };
      }),
      Tooltip: TooltipComponent,
      googleKeywordData: googleData,
      comparedProductData: comparedProductData,
      keywordSummaryData: keywordSummaryData,
      keywordList,
      defaultShowKeyword: defaultShowKeyword,
      oppScene: "new_product_discovery",
      LeftComponent: ProductReport,
      RightComponent: ProductReportBoard,
      logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.REPORT_CARD,
      switchKeywordLogKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.SWITCH_KEYWORD,
    };
  }
  return null;
};

const KEYWORD_SELECT_CARD = (data: any) => {
  if (data?.cardType === "KEYWORD_SELECT_CARD") {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: ImproveKeywordAmazonTable,
      logKeys: {
        selectKeyword: LOG_KEYS.NEW_PRODUCT_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.NEW_PRODUCT_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
};

const PRODUCT_SEL_BASE_DESC = (data: any) => {
  if (data?.cardType === "PRODUCT_SEL_BASE_DESC") {
    return {
      ...data,
      type: "NEW",
      LeftComponent: ModifyFormCard,
      logKey: LOG_KEYS.NEW_PRODUCT_AGENT.LP.MODIFY_FORM,
    };
  }
  return null;
};

const CATE_SELECT_CARD = (data: any) => {
  if (data?.cardType === "CATE_SELECT_CARD") {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: CategoryTikTokTable,
      logKeys: {
        selectKeyword: LOG_KEYS.NEW_PRODUCT_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.NEW_PRODUCT_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
};

// 选品配置blocks
export const productFormatList = [
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  PLAIN_TEXT_FORMAT,
  ICON_TITLE_CARD,
  KEYWORD_SUMMARY_FORMAT,

  PRODUCT_BUTTON_FORMAT,
  NORMAL_PRODUCT_FORMAT,
  NEW_PRODUCT_FORMAT,
  HOT_SALE_PRODUCT_FORMAT,
  COMPARED_PRODUCT_FORMAT,
  OD_COMPARE_PRODUCT_FORMAT,
  PRODUCT_REPORT_CARD_FORMAT,
  KEYWORD_SELECT_CARD,
  PRODUCT_SEL_BASE_DESC,
  CATE_SELECT_CARD,
];
