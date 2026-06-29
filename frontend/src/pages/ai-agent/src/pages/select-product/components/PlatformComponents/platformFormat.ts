import { PlatformChoiceKeywordTable } from './PlatformChoiceKeywordTable';
import { PlatformReportBoard } from './PlatformReportBoard';
import {
  findContentItem,
  KEYWORD_SUMMARY_FORMAT, MARKDOWN_TEXT_FORMAT,
  MODULE_FORMAT, PLAIN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
} from '../format';
import { KeywordButton, NormalProductList, ProductReport, KeywordsCard } from '../LeftComponents';
import { MigratedTable } from './MigratedTable';
import { MigratedList } from './MigratedList';
import { ComparedList } from './ComparedList';
import { ComparedTable } from './ComparedTable';
import { TikTokChoiceKeywordTable } from './TikTokChoiceKeywordTable';
import { CateGoogleTable, CategoryTikTokTable, KeywordAmazonTable, KeywordGoogleTable, NormalProductTable, ModifyFormCard, TooltipComponent } from '../RightComponents';
import { ScoreTable } from './ScoreTable';
import { ImproveKeywordAmazonTable } from '../ImproveComponents/ImproveKeywordAmazonTable';
import { LOG_KEYS } from '@/utils/logConfig';

const MIGRATED_CHOICE_KEYWORD_SELECT_CARD_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    switch (data?.cardSubType) {
      case 'KEYWORD_SELECT_CARD':
        return {
          ...data,
          LeftComponent: data?.isNotShow ? '' : KeywordButton,
          RightComponent: KeywordAmazonTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.KEYWORD_SELECT_CARD,
        };
      case 'KEYWORD_GOOGLE_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: KeywordGoogleTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.KEYWORD_GOOGLE_TRENDS,
        };
      case 'CATE_GOOGLE_TRENDS':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: CateGoogleTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.CATE_GOOGLE_TRENDS,
        };
      case 'CATE_SELECT_CARD':
        return {
          ...data,
          LeftComponent: data?.isNotShow ? '' : KeywordButton,
          RightComponent: CategoryTikTokTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.CATE_SELECT_CARD,
        };
      case 'MIGRATED_CHOICE_KEYWORD_SELECT_CARD':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: PlatformChoiceKeywordTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.MIGRATED_CHOICE_KEYWORD,
        };
      case 'MIGRATED_CHOICE_CATE_SELECT_CARD': {
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: TikTokChoiceKeywordTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.MIGRATED_CHOICE_CATE,
        };
      }
      case 'MIGRATE_CHOICE_KEYWORD_SELECT_CARD':
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: PlatformChoiceKeywordTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.MIGRATE_CHOICE_KEYWORD,
        };
    }
  }
};

export const NORMAL_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === 'PRODUCT_LIST') {
    if (data?.cardSubType === 'NORMAL_PRODUCT') {
      return {
        ...data,
        cardType: 'NORMAL_PRODUCT',
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
        RightComponent: NormalProductTable,
        logKey: LOG_KEYS.PLATFORM_AGENT.LP.NORMAL_PRODUCT,
      };
    }
    return null;
  }
  return null;
};

const MIGRATED_ANALYSIS_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === 'PRODUCT_LIST') {
    switch (data?.cardSubType) {
      case 'MIGRATED_PRODUCT':
        return {
          ...data,
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
          LeftComponent: MigratedList,
          RightComponent: MigratedTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.MIGRATED_PRODUCT,
          logKeyMigratedDetail: LOG_KEYS.PLATFORM_AGENT.LP.MIGRATED_DETAIL,
        };
      case 'MIGRATED_SCORE_PRODUCT':
        return {
          ...data,
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
          LeftComponent: ComparedList,
          RightComponent: ScoreTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.SCORE_PRODUCT,
          logKeyComparedDetail: LOG_KEYS.PLATFORM_AGENT.LP.COMPARED_DETAIL,
        };
      case 'MIGRATED_ANALYSIS_PRODUCT':
        return {
          ...data,
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
          LeftComponent: ComparedList,
          RightComponent: ComparedTable,
          logKey: LOG_KEYS.PLATFORM_AGENT.LP.ANALYSIS_PRODUCT,
          logKeyComparedDetail: LOG_KEYS.PLATFORM_AGENT.LP.COMPARED_DETAIL,
        };
    }
  }
};

const KEYWORD_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'KEYWORD_SELECT_CARD') {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: ImproveKeywordAmazonTable,
      logKeys: {
        selectKeyword: LOG_KEYS.PLATFORM_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.PLATFORM_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
}

const PRODUCT_SEL_BASE_DESC = (data: any) => {
  if (data?.cardType === 'PRODUCT_SEL_BASE_DESC') {
    return {
      ...data,
      type: data?.productDescRequestDTO?.migrationType,
      LeftComponent: ModifyFormCard,
      logKey: LOG_KEYS.PLATFORM_AGENT.LP.MODIFY_FORM,
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
        selectKeyword: LOG_KEYS.PLATFORM_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.PLATFORM_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
}

const createReportCardFormat = (data: any, blocks: any[], oppScene: string, logKey: string, switchKeywordLogKey: string) => {
  if (data?.cardType === 'REPORT_CARD') {
    const tikTokData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_SELECT_CARD');
    const googleKeywordData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_GOOGLE_TRENDS');
    const cateGoogleData = findContentItem(blocks, data.taskId, 'BUTTON', 'CATE_GOOGLE_TRENDS');
    const googleData = googleKeywordData || cateGoogleData;
    const comparedProductData = findContentItem(blocks, data.taskId, 'PRODUCT_LIST', 'MIGRATED_ANALYSIS_PRODUCT');
    const keywordSummaryData = findContentItem(blocks, data.taskId, 'KEYWORD_SUMMARY');
    const categoryTikTokData = findContentItem(blocks, data.taskId, 'BUTTON', 'KEYWORD_SELECT_CARD');
    const keywordList = tikTokData?.keywordList || categoryTikTokData?.keywordList || [];
    const defaultShowKeyword = tikTokData?.defaultShowKeyword || categoryTikTokData?.defaultShowKeyword || '';
    return {
      ...data,
      itemBtn: data?.reportTags.map((item: any) => {
        return {
          key: item,
          value: item,
        };
      }),
      Tooltip: TooltipComponent,
      googleKeywordData: googleData,
      comparedProductData: comparedProductData,
      keywordSummaryData: keywordSummaryData,
      tikTokData,
      keywordList,
      oppScene,
      defaultShowKeyword: defaultShowKeyword,
      logKey,
      switchKeywordLogKey,
      LeftComponent: ProductReport,
      RightComponent: PlatformReportBoard,
    };
  }
}

const REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  return createReportCardFormat(data, blocks, 'platform_market_migration', LOG_KEYS.PLATFORM_AGENT.LP.REPORT_CARD, LOG_KEYS.PLATFORM_AGENT.LP.SWITCH_KEYWORD);
};
const COUNTRY_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  return createReportCardFormat(data, blocks, 'country_market_migration', LOG_KEYS.COUNTRY_AGENT.LP.REPORT_CARD, LOG_KEYS.COUNTRY_AGENT.LP.SWITCH_KEYWORD);
};

// COUNTRY_AGENT 专用的 KEYWORD_SELECT_CARD
const COUNTRY_KEYWORD_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'KEYWORD_SELECT_CARD') {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: ImproveKeywordAmazonTable,
      logKeys: {
        selectKeyword: LOG_KEYS.COUNTRY_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.COUNTRY_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
}

// COUNTRY_AGENT 专用的 CATE_SELECT_CARD
const COUNTRY_CATE_SELECT_CARD = (data: any) => {
  if (data?.cardType === 'CATE_SELECT_CARD') {
    return {
      ...data,
      LeftComponent: KeywordsCard,
      RightComponent: CategoryTikTokTable,
      logKeys: {
        selectKeyword: LOG_KEYS.COUNTRY_AGENT.LP.SELECT_KEYWORD,
        viewKeywordData: LOG_KEYS.COUNTRY_AGENT.LP.VIEW_KEYWORD_DATA,
      },
    };
  }
  return null;
}

const formatList = [
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  PLAIN_TEXT_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
  MIGRATED_CHOICE_KEYWORD_SELECT_CARD_FORMAT,
  NORMAL_PRODUCT_FORMAT,
  MIGRATED_ANALYSIS_PRODUCT_FORMAT,
  KEYWORD_SELECT_CARD,
  PRODUCT_SEL_BASE_DESC,
  CATE_SELECT_CARD,
]
// 平台配置blocks
export const platformFormatList = [
  ...formatList,
  REPORT_CARD_FORMAT,
];

// 国家的配置blocks
export const countryFormatList = [
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  PLAIN_TEXT_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
  MIGRATED_CHOICE_KEYWORD_SELECT_CARD_FORMAT,
  NORMAL_PRODUCT_FORMAT,
  MIGRATED_ANALYSIS_PRODUCT_FORMAT,
  COUNTRY_KEYWORD_SELECT_CARD, // 使用 COUNTRY 专用版本
  PRODUCT_SEL_BASE_DESC,
  COUNTRY_CATE_SELECT_CARD, // 使用 COUNTRY 专用版本
  COUNTRY_REPORT_CARD_FORMAT,
]