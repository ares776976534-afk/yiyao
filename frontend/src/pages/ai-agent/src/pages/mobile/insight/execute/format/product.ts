import { KeywordsCard, KeywordButton, ProductReport } from "@/pages/select-product/components/LeftComponents";
import { ComparedProductTable } from "@/pages/select-product/components/RightComponents";
import { keywordsTable, ItemButton } from '@/pages/mobile/insight/execute/components';
import ReportContent from '../product/reportContent';
import { MODULE_FORMAT, MARKDOWN_TEXT_FORMAT, TASK_EXECUTION_BRIEF_FORMAT, findContentItem, KEYWORD_SUMMARY_FORMAT } from '@/pages/select-product/components/format';

// 选择更多关键词
const KEYWORD_SELECT_CARD = (data: any) => {
  if (data?.cardType === "KEYWORD_SELECT_CARD") {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: keywordsTable,
    };
  }
  return null;
};

// 任务执行的关键词按钮及列表
export const PRODUCT_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    switch (data?.cardSubType) {
      case "KEYWORD_SELECT_CARD":
        return {
          ...data,
          LeftComponent: data?.isNotShow ? "" : KeywordButton,
          // RightComponent: KeywordAmazonTable,
        };
      case "KEYWORD_GOOGLE_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          // RightComponent: KeywordGoogleTable,
        };
      case "CATE_GOOGLE_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          // RightComponent: CateGoogleTable,
        };
      case "CATE_SELECT_CARD":
        return {
          ...data,
          LeftComponent: data?.isNotShow ? "" : KeywordButton,
          // RightComponent: CategoryTikTokTable,
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
        LeftComponent: ItemButton,
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
        LeftComponent: ItemButton,
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
        LeftComponent: ItemButton,
      };
    }
    return null;
  }
  return null;
};

const COMPARED_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "COMPARED_PRODUCT") {
      return {
        ...data,
        cardType: "COMPARED_PRODUCT",
        LeftComponent: ItemButton,
        RightComponent: ComparedProductTable,
      };
    }
    return null;
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
      // Tooltip: TooltipComponent,
      googleKeywordData: googleData,
      comparedProductData: comparedProductData,
      keywordSummaryData: keywordSummaryData,
      keywordList,
      defaultShowKeyword: defaultShowKeyword,
      oppScene: "new_product_discovery",
      LeftComponent: ProductReport,
      RightComponent: ReportContent,
    };
  }
  return null;
};

// mobile选品配置blocks
export const productFormatList = [
  MODULE_FORMAT, // 吐卡
  KEYWORD_SELECT_CARD, // 关键词卡片
  MARKDOWN_TEXT_FORMAT, // 任务规划的markdown
  TASK_EXECUTION_BRIEF_FORMAT, // 任务执行加载
  PRODUCT_BUTTON_FORMAT, // 关键词按钮
  NORMAL_PRODUCT_FORMAT, // 搜索的商品列表
  NEW_PRODUCT_FORMAT, // 新品的商品列表
  HOT_SALE_PRODUCT_FORMAT, // 同类目热销列表
  COMPARED_PRODUCT_FORMAT, // 新品vs同类目商品列表
  PRODUCT_REPORT_CARD_FORMAT,
  KEYWORD_SUMMARY_FORMAT, // 分析的markdown
];