import { KeywordButton, NormalProductList, ProductReport, KeywordsCard } from '../LeftComponents';
import { CateGoogleTable, CategoryTikTokTable, KeywordGoogleTable, ModifyFormCard, TooltipComponent } from '../RightComponents';
import { LOG_KEYS } from '@/utils/logConfig';
import { ImproveChoiceKeywordTable } from './ImproveChoiceKeywordTable';
import { ImproveCommentTable } from './ImproveCommentTable';
import { ImproveKeywordAmazonTable } from './ImproveKeywordAmazonTable';
import { ReviewTable } from './ReviewTable';
import {
  MODULE_FORMAT, MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT, PLAIN_TEXT_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
  findContentItem,
} from '../format';
import { AnalysisProductList } from './AnalysisProductList';
import { AnalysisProductTable } from './AnalysisProductTable';
import { ImproveReportBoard } from './ImproveReportBoard';
import { TikTokChoiceKeywordTable } from './TikTokChoiceKeywordTable';

const IMPROVE_CHOICE_KEYWORD_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    switch (data?.cardSubType) {
      case 'IMPROVE_CHOICE_KEYWORD_SELECT_CARD':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: ImproveChoiceKeywordTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.IMPROVE_CHOICE_KEYWORD,
        };
      case 'CATE_GOOGLE_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CateGoogleTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.CATE_GOOGLE_TRENDS,
        };
      case 'IMPROVE_CHOICE_CATE_SELECT_CARD': {
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: TikTokChoiceKeywordTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.IMPROVE_CHOICE_CATE,
        };
      }
      case 'CATE_SELECT_CARD':
        return {
          ...data,
          LeftComponent: data?.isNotShow ? '' : KeywordButton,
          RightComponent: CategoryTikTokTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.CATE_SELECT_CARD,
        };
      default:
        return null;
    }
  }
  return null;
};

const IMPROVE_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    switch (data?.cardSubType) {
      case 'KEYWORD_SELECT_CARD':
        return {
          ...data,
          LeftComponent: data?.isNotShow ? '' : KeywordButton,
          RightComponent: ImproveKeywordAmazonTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.KEYWORD_SELECT_CARD,
        };
      case 'KEYWORD_GOOGLE_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: KeywordGoogleTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.KEYWORD_GOOGLE_TRENDS,
        };
      case 'CATE_SELECT_CARD':
        return {
          ...data,
          LeftComponent: data?.isNotShow ? '' : KeywordButton,
          RightComponent: CategoryTikTokTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.CATE_SELECT_CARD,
        };
      case 'PRODUCT_IMPROVE_COMMENT_TAGS':
        return {
          ...data,
          cardType: 'PRODUCT_IMPROVE_COMMENT_TAGS',
          LeftComponent: KeywordButton,
          RightComponent: ImproveCommentTable,
          logKey: LOG_KEYS.IMPROVE_AGENT.LP.COMMENT_TAGS,
        };
      default:
        return null;
    }
  }
  return null;
};

const REVIEWED_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === 'PRODUCT_LIST') {
    if (data?.cardSubType === 'REVIEWED_PRODUCT') {
      return {
        ...data,
        cardType: 'REVIEWED_PRODUCT',
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: '{value}',
                value: item?.itemSubInfo,
              },
            ],
          };
        }),
        LeftComponent: NormalProductList,
        RightComponent: ReviewTable,
        logKey: LOG_KEYS.IMPROVE_AGENT.LP.REVIEWED_PRODUCT,
      };
    }
  }
  return null;
};

export const IMPROVED_ANALYSIS_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === 'PRODUCT_LIST') {
    if (data?.cardSubType === 'IMPROVED_ANALYSIS_PRODUCT') {
      return {
        ...data,
        cardType: 'IMPROVED_ANALYSIS_PRODUCT',
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: '{value}',
                value: item?.itemSubInfo,
              },
            ],
          };
        }),
        LeftComponent: AnalysisProductList,
        RightComponent: AnalysisProductTable,
        logKey: LOG_KEYS.IMPROVE_AGENT.LP.ANALYSIS_PRODUCT,
        logKeyAnalysisDetail: LOG_KEYS.IMPROVE_AGENT.LP.ANALYSIS_DETAIL,
      };
    }
  }
  return null;
};

const IMPROVE_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === 'REPORT_CARD') {
    const amazonKeywordData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_SELECT_CARD');
    const googleKeywordData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_GOOGLE_TRENDS');
    const cateGoogleData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_GOOGLE_TRENDS');
    // const categoryTikTokData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_SELECT_CARD');
    const googleData = googleKeywordData || cateGoogleData;
    const summary = findContentItem(blocks, data.taskId, 'KEYWORD_IMPROVE_SUMMARY');
    const keywordSummaryData = findContentItem(blocks, data.taskId, 'KEYWORD_SUMMARY');
    const improvedAnalysisProductData = findContentItem(blocks, data.taskId, 'IMPROVED_ANALYSIS_PRODUCT');
    const productImproveCommentTagsData = findContentItem(blocks, data.taskId, 'PRODUCT_IMPROVE_COMMENT_TAGS')?.reviewTagAggregateVOList;
    const reportTime = findContentItem(blocks, data.taskId, 'PRODUCT_IMPROVE_COMMENT_TAGS')?.reportTime;
    const goodList = productImproveCommentTagsData?.filter((item: any) => item?.sentimentTypeName === '好评');
    const badList = productImproveCommentTagsData?.filter((item: any) => item?.sentimentTypeName === '差评');
    const neutralList = productImproveCommentTagsData?.filter((item: any) => item?.sentimentTypeName === '中评');
    const keywordList = amazonKeywordData?.keywordList || [];
    const defaultShowKeyword = amazonKeywordData?.defaultShowKeyword || '';
    return {
      ...data,
      itemBtn: data?.reportTags.map((item: any) => {
        return {
          key: item,
          value: item,
        };
      }),
      googleKeywordData: googleData,
      keywordSummaryData: keywordSummaryData,
      improvedAnalysisProductData: improvedAnalysisProductData,
      goodList: goodList,
      badList: badList,
      neutralList: neutralList,
      keywordList,
      summary,
      oppScene: 'product_improvement',
      defaultShowKeyword: defaultShowKeyword,
      reportTime,
      Tooltip: TooltipComponent,
      LeftComponent: ProductReport,
      RightComponent: ImproveReportBoard,
      logKey: LOG_KEYS.IMPROVE_AGENT.LP.REPORT_CARD,
      switchKeywordLogKey: LOG_KEYS.IMPROVE_AGENT.LP.SWITCH_KEYWORD,
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
        selectKeyword: LOG_KEYS.IMPROVE_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.IMPROVE_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
}

const PRODUCT_SEL_BASE_DESC = (data: any) => {
  if (data?.cardType === 'PRODUCT_SEL_BASE_DESC') {
    return {
      ...data,
      type: 'IMPROVE',
      LeftComponent: ModifyFormCard,
      logKey: LOG_KEYS.IMPROVE_AGENT.LP.MODIFY_FORM,
    };
  }
  return null;
}

const CATE_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'CATE_SELECT_CARD') {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: CategoryTikTokTable,
      logKeys: {
        selectKeyword: LOG_KEYS.IMPROVE_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.IMPROVE_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
}

const KEYWORD_IMPROVE_SUMMARY = (data: any) => {
  if (data?.cardType === 'KEYWORD_IMPROVE_SUMMARY') {
    return {
      ...data,
      LeftComponent: null,
    };
  }
  return null;
}

// 改进配置blocks
export const improveFormatList = [
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  IMPROVE_BUTTON_FORMAT,
  REVIEWED_PRODUCT_FORMAT,
  IMPROVED_ANALYSIS_PRODUCT_FORMAT,
  PLAIN_TEXT_FORMAT,
  IMPROVE_REPORT_CARD_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
  IMPROVE_CHOICE_KEYWORD_SELECT_CARD,
  KEYWORD_SELECT_CARD,
  PRODUCT_SEL_BASE_DESC,
  CATE_SELECT_CARD,
  KEYWORD_IMPROVE_SUMMARY,
];