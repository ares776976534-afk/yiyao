import { KeywordButton, NormalProductList, UserInputText } from '../../../select-product/components/LeftComponents';
import { CateGoogleTable, CategoryTikTokTable, KeywordGoogleTable } from '../../../select-product/components/RightComponents';
import { ImproveChoiceKeywordTable } from '../../../select-product/components/ImproveComponents/ImproveChoiceKeywordTable';
import { ImproveCommentTable } from '../../../select-product/components/ImproveComponents/ImproveCommentTable';
import { ImproveKeywordAmazonTable } from '../../../select-product/components/ImproveComponents/ImproveKeywordAmazonTable';
import {
  MODULE_FORMAT, MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT, PLAIN_TEXT_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
} from '../../../select-product/components/format';
import { TikTokChoiceKeywordTable } from '../../../select-product/components/ImproveComponents/TikTokChoiceKeywordTable';
import { ThinkingPlainText } from '../../../select-product/components/LeftComponents/ThinkingPlainText';
import ReportButton from './ReportButton';
import ReportContent from './ReportContent';
import { ToolProductTable } from './ToolProductTable';
import { ToolRankTable } from './ToolRankTable';
import { KeywordMarketAnalysisTable } from './KeywordMarketAnalysisTable';
import { OriginalReview } from './OriginalReview';
import ProductSearchTable from '../ProductSearchTable';
import SupplierSearchTable from '../SupplierSearchTable';
import PreSelectBusiness from '../PerSelectBusiness';
import { exportSelectProductReport } from '@/pages/select-product/services';
import { message } from 'antd';
const IMPROVE_CHOICE_KEYWORD_AMAZON_SEARCH_TRENDS = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    switch (data?.cardSubType) {
      case 'IMPROVE_CHOICE_KEYWORD_AMAZON_SEARCH_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: ImproveChoiceKeywordTable,
        };
      case 'CATE_GOOGLE_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CateGoogleTable,
        };
      case 'IMPROVE_CHOICE_CATE_TIKTOK_SEARCH_TRENDS': {
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: TikTokChoiceKeywordTable,
        };
      }
      default:
        return null;
    }
  }
  return null;
};

const IMPROVE_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    switch (data?.cardSubType) {
      case 'KEYWORD_AMAZON_SEARCH_TRENDS':
        return {
          ...data,
          excludeCols: ['salesInfo'],
          LeftComponent: KeywordButton,
          RightComponent: ImproveKeywordAmazonTable,
        };
      case 'KEYWORD_GOOGLE_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: KeywordGoogleTable,
        };
      case 'CATE_TIKTOK_SEARCH_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CategoryTikTokTable,
        };
      case 'PRODUCT_IMPROVE_COMMENT_TAGS':
        return {
          ...data,
          cardType: 'PRODUCT_IMPROVE_COMMENT_TAGS',
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
  if (data?.cardType === 'PRODUCT_LIST') {
    if (data?.cardSubType === 'TOOL_PRODUCT') {
      return {
        ...data,
        cardType: 'TOOL_PRODUCT',
        oppProductList: data?.oppProductList,
        LeftComponent: NormalProductList,
        RightComponent: ToolProductTable,
      };
    }
    return null;
  }
  return null;
};

const IMPROVE_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === 'REPORT_CARD') {
    // 再加一层
    switch (data.cardSubType) {
      case 'SELECT_PROVIDER_BY_OFFER_CARD':
        // 以品找商结果
        return {
          ...data,
          LeftComponent: ReportButton,
          onExportReport: () => {
            exportSelectProductReport({
              sessionId: data.sessionId,
              taskId: data.taskId,
            }).then((res) => {
              const { success, msg, result } = res;
              if (success) {
                window.open(result);
              } else {
                message.error(msg);
              }
            });
            // console.log('onExportReportFn', data);
          },
          RightComponent: ProductSearchTable,
        };
      case 'SELECT_PROVIDER_CARD':
        // 广泛找商结果
        return {
          ...data,
          LeftComponent: ReportButton,
          onExportReport: () => {
            exportSelectProductReport({
              sessionId: data.sessionId,
              taskId: data.taskId,
            }).then((res) => {
              const { success, msg, result } = res;
              if (success) {
                window.open(result);
              } else {
                message.error(msg);
              }
            });
            // console.log('onExportReportFn', data);
          },
          RightComponent: SupplierSearchTable,
        };
      default:
        return null;
    }
  }

  return null;
};

export const USER_INPUT_PLAIN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === 'USER_REQUEST') {
    return {
      ...data,
      LeftComponent: UserInputText,
    };
  }
  return null;
};

const THINKING_PLAIN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === 'TOOL_TEXT') {
    return {
      ...data,
      LeftComponent: ThinkingPlainText,
    };
  }
  return null;
};

const ORIGINAL_REVIEW_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    if (data?.cardSubType === 'ORIGINAL_REVIEW') {
      console.log(data);
      return {
        ...data,
        LeftComponent: KeywordButton,
        RightComponent: OriginalReview,
      };
    }
    return null;
  }
};

const TOOL_RANK_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    if (data?.cardSubType === 'TOOL_RANK_PRODUCT') {
      return {
        ...data,
        oppProductList: data?.oppProductList,
        LeftComponent: KeywordButton,
        RightComponent: ToolRankTable,
      };
    }
  }
};

const KEYWORD_MARKET_ANALYSIS_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    if (data?.cardSubType === 'KEYWORD_MARKET_ANALYSIS') {
      return {
        ...data,
        marketAnalysisList: data?.marketAnalysisList,
        LeftComponent: KeywordButton,
        RightComponent: KeywordMarketAnalysisTable,
      };
    }
  }
};

const IMAGE_REGION_SELECTION_CARD = (data: any) => {
  if (data?.cardType === 'IMAGE_REGION_SELECTION_CARD' && data.eventType === 'DATA_DISPLAY') {
    return {
      ...data,
      LeftComponent: PreSelectBusiness,
      RightComponent: null,
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
  IMPROVE_REPORT_CARD_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
  IMPROVE_CHOICE_KEYWORD_AMAZON_SEARCH_TRENDS,
  USER_INPUT_PLAIN_TEXT_FORMAT,
  THINKING_PLAIN_TEXT_FORMAT,
  ORIGINAL_REVIEW_FORMAT,
  TOOL_RANK_PRODUCT_FORMAT,
  KEYWORD_MARKET_ANALYSIS_FORMAT,
  IMAGE_REGION_SELECTION_CARD,
];