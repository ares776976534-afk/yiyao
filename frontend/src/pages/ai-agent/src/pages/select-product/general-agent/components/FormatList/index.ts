import {
  KeywordButton,
  NormalProductList,
  UserInputText,
  IconText,
  KeywordsCard,
} from "../../../components/LeftComponents";
import {
  CateGoogleTable,
  CategoryTikTokTable,
  KeywordGoogleTable,
  TooltipComponent,
} from "../../../components/RightComponents";
import { ImproveChoiceKeywordTable } from "../../../components/ImproveComponents/ImproveChoiceKeywordTable";
import { ImproveCommentTable } from "../../../components/ImproveComponents/ImproveCommentTable";
import { ImproveKeywordAmazonTable } from "../../../components/ImproveComponents/ImproveKeywordAmazonTable";
import {
  MODULE_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  PLAIN_TEXT_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
} from "../../../components/format";
import { TikTokChoiceKeywordTable } from "../../../components/ImproveComponents/TikTokChoiceKeywordTable";
import { ThinkingPlainText } from "../../../components/LeftComponents/ThinkingPlainText";
import ReportButton from "./ReportButton";
import ReportContent from "./ReportContent";
import { ToolProductTable } from "./ToolProductTable";
import { ToolRankTable } from "./ToolRankTable";
import { KeywordMarketAnalysisTable } from "./KeywordMarketAnalysisTable";
import { OriginalReview } from "./OriginalReview";
import ConfirmPlanBtn from "./ConfirmPlanBtn";
import InputWordCateDistribution from "./InputWordCateDistribution";
import KeyworkGoogleSearch from "./KeyworkGoogleSearch";
import KeyWordReview from "./KeyWordReview";
import { WEB_SEARCH_BUTTON_FORMAT } from "@/pages/common-chat/components/FormatList";
import KeywordDetail from "./KeywordDetails";
import { TaskPlanning } from '@/pages/select-product/components/LeftComponents';
import { COMPARED_PRODUCT_FORMAT } from '@/pages/select-product/components/format';
import { IMPROVED_ANALYSIS_PRODUCT_FORMAT } from '@/pages/select-product/components/ImproveComponents/improveFormat';
import FollowUpQuestions from './FollowUpQuestions';
import { LOG_KEYS } from '@/utils/logConfig';
import { extraData } from '../RecommendedProducts/mock';

const IMPROVE_CHOICE_KEYWORD_AMAZON_SEARCH_TRENDS = (data: any) => {
  if (data?.cardType === "BUTTON") {
    switch (data?.cardSubType) {
      case "IMPROVE_CHOICE_KEYWORD_AMAZON_SEARCH_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: ImproveChoiceKeywordTable,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.KEYWORD_AMAZON_TRENDS,
        };
      case "CATE_GOOGLE_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CateGoogleTable,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.CATE_GOOGLE_TRENDS,
        };
      case "IMPROVE_CHOICE_CATE_TIKTOK_SEARCH_TRENDS": {
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: TikTokChoiceKeywordTable,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.CATE_TIKTOK_TRENDS,
        };
      }
      case "KEYWORD_DETAIL":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: KeywordDetail,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.KEYWORD_DETAIL,
        };
      default:
        return null;
    }
  }
  return null;
};

const IMPROVE_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    switch (data?.cardSubType) {
      case "KEYWORD_AMAZON_SEARCH_TRENDS":
        return {
          ...data,
          excludeCols: ["salesInfo"],
          LeftComponent: KeywordButton,
          RightComponent: ImproveKeywordAmazonTable,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.KEYWORD_AMAZON_TRENDS,
        };
      case "KEYWORD_GOOGLE_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: KeyworkGoogleSearch,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.KEYWORD_GOOGLE_TRENDS,
        };
      case "CATE_TIKTOK_SEARCH_TRENDS":
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CategoryTikTokTable,
          logKey: LOG_KEYS.GENERAL_AGENT.LP.CATE_TIKTOK_TRENDS,
        };
      case "PRODUCT_IMPROVE_COMMENT_TAGS":
        return {
          ...data,
          cardType: "PRODUCT_IMPROVE_COMMENT_TAGS",
          LeftComponent: KeywordButton,
          RightComponent: ImproveCommentTable,
        };
      default:
        return null;
    }
  }
  return null;
};

const TOOL_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (data?.cardSubType === "TOOL_PRODUCT") {
      return {
        ...data,
        cardType: "TOOL_PRODUCT",
        oppProductList: data?.oppProductList,
        LeftComponent: NormalProductList,
        RightComponent: ToolProductTable,
        logKey: LOG_KEYS.GENERAL_AGENT.LP.ITEM_LIST,
        imgClickLogKey: LOG_KEYS.GENERAL_AGENT.LP.ITEMLIST_IMGCLICK,
      };
    }
    return null;
  }
  return null;
};

const IMPROVE_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === "REPORT_CARD") {
    return {
      ...data,
      oppScene: "algo",
      onExportReport: true,
      LeftComponent: ReportButton,
      RightComponent: ReportContent,
      Tooltip: TooltipComponent,
    };
  }
  return null;
};

const USER_INPUT_PLAIN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === "USER_REQUEST") {
    return {
      ...data,
      LeftComponent: UserInputText,
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

const THINKING_PLAIN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === "TOOL_TEXT") {
    return {
      ...data,
      LeftComponent: ThinkingPlainText,
    };
  }
  return null;
};

const ORIGINAL_REVIEW_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    if (data?.cardSubType === "ORIGINAL_REVIEW") {
      console.log(data);
      return {
        ...data,
        LeftComponent: KeywordButton,
        RightComponent: OriginalReview,
        logKey: LOG_KEYS.GENERAL_AGENT.LP.ORIGINAL_REVIEW,
      };
    }
    return null;
  }
};

const TOOL_RANK_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    if (data?.cardSubType === "TOOL_RANK_PRODUCT") {
      return {
        ...data,
        oppProductList: data?.oppProductList,
        LeftComponent: KeywordButton,
        RightComponent: ToolRankTable,
        logKey: LOG_KEYS.GENERAL_AGENT.LP.TOOL_RANK_PRODUCT,
      };
    }
  }
};

const KEYWORD_MARKET_ANALYSIS_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    if (data?.cardSubType === "KEYWORD_MARKET_ANALYSIS") {
      return {
        ...data,
        marketAnalysisList: data?.marketAnalysisList,
        LeftComponent: KeywordButton,
        RightComponent: KeywordMarketAnalysisTable,
        logKey: LOG_KEYS.GENERAL_AGENT.LP.KEYWORD_MARKET_ANALYSIS,
      };
    }
    if (data?.cardSubType === "KEYWORD_REVIEW") {
      return {
        ...data,
        LeftComponent: KeywordButton,
        RightComponent: KeyWordReview,
        logKey: LOG_KEYS.GENERAL_AGENT.LP.KEYWORD_REVIEW,
      };
    }
  }
};

const CONFIRM_PLAN_FORMAT = (data: any) => {
  if (data?.cardType === "SELECTION_EXPERT_PLAN_CONFIRM") {
    return {
      ...data,
      LeftComponent: ConfirmPlanBtn,
    };
  }
};

const INPUT_WORD_CATE_DISTRIBUTION_FORMAT = (data: any) => {
  if (data?.cardType === "BUTTON") {
    if (data?.cardSubType === "INPUT_WORD_CATE_DISTRIBUTION") {
      return {
        ...data,
        LeftComponent: KeywordButton,
        RightComponent: InputWordCateDistribution,
        logKey: LOG_KEYS.GENERAL_AGENT.LP.INPUT_WORD_CATE,
      };
    }
  }
};

const MARKDOWN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === "MARKDOWN_TEXT") {
    return {
      ...data,
      cardType: "PLAIN_TEXT",
      text: data?.markdownContent,
      LeftComponent: TaskPlanning,
    };
  }
  return null;
};

const FOLLOW_UPS_FORMAT = (data: any) => {
  if (data?.cardType === "FOLLOW_UPS") {
    return {
      ...data,
      LeftComponent: FollowUpQuestions,
    };
  }
  return null;
};

const KEYWORD_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'KEYWORD_SELECT_CARD') {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: ImproveKeywordAmazonTable,
      logKeys: {
        selectKeyword: LOG_KEYS.GENERAL_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.GENERAL_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
};

const CATE_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'CATE_SELECT_CARD') {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: CategoryTikTokTable,
      logKeys: {
        selectKeyword: LOG_KEYS.GENERAL_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.GENERAL_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
};

export default [
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  IMPROVE_BUTTON_FORMAT,
  TOOL_PRODUCT_FORMAT,
  PLAIN_TEXT_FORMAT,
  
  KEYWORD_SUMMARY_FORMAT,
  IMPROVE_CHOICE_KEYWORD_AMAZON_SEARCH_TRENDS,
  USER_INPUT_PLAIN_TEXT_FORMAT,
  THINKING_PLAIN_TEXT_FORMAT,
  ORIGINAL_REVIEW_FORMAT,
  TOOL_RANK_PRODUCT_FORMAT,
  KEYWORD_MARKET_ANALYSIS_FORMAT,
  CONFIRM_PLAN_FORMAT,
  INPUT_WORD_CATE_DISTRIBUTION_FORMAT,
  WEB_SEARCH_BUTTON_FORMAT,
  ICON_TITLE_CARD,
  COMPARED_PRODUCT_FORMAT,
  IMPROVED_ANALYSIS_PRODUCT_FORMAT,
  FOLLOW_UPS_FORMAT,
  KEYWORD_SELECT_CARD,
  CATE_SELECT_CARD,
  IMPROVE_REPORT_CARD_FORMAT,
];
