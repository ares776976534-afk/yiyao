import { KeywordButton, NormalProductList } from '../LeftComponents';
import CommonTable from '@/components/CommonTable';
import {
  MODULE_FORMAT, MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT, PLAIN_TEXT_FORMAT,
  KEYWORD_SUMMARY_FORMAT, productFormatList,
} from '../format';
import { ProductMarketList } from './ProductMarketList';
import ProductMarketDetailInfo from './ProductMarketDetailInfo';
import { $t } from '@/i18n';
import ReportBoard from './ReportBoard';
import { ReviewTable } from './ReviewTable';
import { ComparedList } from './ComparedList';
import { ImproveCommentTable } from '../ImproveComponents/ImproveCommentTable';
import ProductReport from './ProductReport';
import { TooltipComponent } from '../RightComponents';
import FollowUpQuestions from '@/pages/select-product/general-agent/components/FormatList/FollowUpQuestions';
import { ToolProductTable } from '@/pages/select-product/general-agent/components/FormatList/ToolProductTable';
import { LOG_KEYS } from '@/utils/logConfig';


const IMAGE_SEARCH_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === 'BUTTON') {
    switch (data?.cardSubType) {
      case 'PRODUCT_IMPROVE_COMMENT_TAGS':
        console.log('PRODUCT_IMPROVE_COMMENT_TAGS', data);
        return {
          ...data,
          LeftComponent: KeywordButton,
          RightComponent: ImproveCommentTable,
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
      };
    }
  }
  return null;
};

// const IMAGE_SEARCH_ANALYSIS_PRODUCT_FORMAT = (data: any) => {
//   if (data?.cardType === 'PRODUCT_LIST') {
//     // if (data?.cardSubType === 'IMPROVED_ANALYSIS_PRODUCT') {
//     //   return {
//     //     ...data,
//     //     cardType: 'IMPROVED_ANALYSIS_PRODUCT',
//     //     oppProductList: data?.oppProductList?.map((item: any) => {
//     //       return {
//     //         ...item,
//     //         content: [
//     //           {
//     //             text: '{value}',
//     //             value: item?.itemSubInfo,
//     //           },
//     //         ],
//     //       };
//     //     }),
//     //     LeftComponent: AnalysisProductList,
//     //     RightComponent: AnalysisProductTable,
//     //   };
//     // }
//   }
//   return null;
// };

const IMAGE_SEARCH_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === 'REPORT_CARD') {
    const reportCardDataList = data.reportCardDataList as Array<{
      cardId: string;
      cardSubType?: string;
      cardType: string;
      isSupportRawData?: boolean;
      rawData?: string | Record<string, any>;
    }>;

    // console.log('formatBlocks data', blocks);

    const allBlocks: Record<string, any> = {};
    (blocks || []).forEach(item => {
      const key = `${item.cardId}_${item.cardType}_${item.cardSubType}`;
      if (!allBlocks[key]) {
        allBlocks[key] = item;
      } else {
        console.warn('key already exists', key);
      }

      if (item.accordionContent && item.accordionContent.length > 0) {
        (item.accordionContent || []).forEach(accordionItem => {
          const accordionKey = `${accordionItem.cardId}_${accordionItem.cardType}_${accordionItem.cardSubType}`;
          if (!allBlocks[accordionKey]) {
            allBlocks[accordionKey] = accordionItem;
          } else {
            console.warn('accordionKey already exists', accordionKey);
          }
        });
      }
    });

    const blockList: any[] = [];
    (reportCardDataList || []).forEach((item) => {
      if (item?.isSupportRawData) {
        blockList.push(item);
        return;
      }
      const cardKey = `${item.cardId}_${item.cardType}_${item.cardSubType}`;
      const findBlock = allBlocks[cardKey];

      // const findBlock = (blocks || []).find((block: any) => {
      //   let isMatch = true;
      //   if (item.cardSubType) {
      //     isMatch = block.cardSubType === item.cardSubType;
      //   }
      //   if (item.cardType && isMatch) {
      //     isMatch = block.cardType === item.cardType;
      //   }
      //   isMatch = isMatch && block.cardId === item.cardId;
      //   return isMatch;
      // });
      if (findBlock) {
        blockList.push({
          ...item,
          ...findBlock,
        });
      } else {
        console.warn('findBlock not found', item);
      }
    });

    if (blockList.length !== reportCardDataList.length) {
      console.warn('blockList.length !== reportCardDataList.length', blockList.length, reportCardDataList.length);
    }

    return {
      ...data,
      Tooltip: TooltipComponent,
      formatBlocks: blockList,
      LeftComponent: ProductReport,
      RightComponent: ReportBoard,
    };
  }
  return null;
};

const KEYWORD_IMAGE_SEARCH_SUMMARY = (data: any) => {
  if (data?.cardType === 'IMAGE_SEARCH_SUMMARY') {
    return {
      ...data,
      // LeftComponent: null,
    };
  }
  return null;
};

const PRODUCT_MARKET_LIST_FORMAT = (data: any) => {
  if (data?.cardType === "IMAGE_SEARCH_MARKET_ABSTRACT_INFO") {
    return {
      ...data,
      LeftComponent: ProductMarketList,
      RightComponent: CommonTable,
    };
  }
  return null;
};

const PRODUCT_MARKET_DETAIL_INFO_FORMAT = (data: any) => {
  if (data?.cardType === "IMAGE_SEARCH_MARKET_DETAIL_INFO") {
    return {
      ...data,
      LeftComponent: ProductMarketDetailInfo,
      RightComponent: CommonTable,
    };
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

const FOLLOW_UPS_FORMAT = (data: any) => {
  if (data?.cardType === "FOLLOW_UPS") {
    return {
      ...data,
      logKey: LOG_KEYS.IMAGE_SEARCH_AGENT.LP.FOLLOW_UP,
      LeftComponent: FollowUpQuestions,
    };
  }
  return null;
};

export const IMAGE_SEARCH_NORMAL_PRODUCT_FORMAT = (data: any) => {
  if (data?.cardType === "PRODUCT_LIST") {
    if (
      data?.cardSubType === "NORMAL_PRODUCT"
    ) {
      return {
        ...data,
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: $t(
                  "global-1688-ai-app.select-product.format.valuegtk",
                  "{value}个同款",
                ),
                value: item?.spItemCnt,
              },
            ],
          };
        }),
        LeftComponent: NormalProductList,
        RightComponent: CommonTable,
      };
    }
    if (data?.cardSubType === 'IMAGE_SEARCH_ANALYSIS_PRODUCT_CARD') {
      return {
        ...data,
        oppProductList: data?.oppProductList?.map((item: any) => {
          return {
            ...item,
            content: [
              {
                text: "{value}条评论",
                value: item?.reviewCnt,
              },
            ],
          };
        }),
        LeftComponent: ComparedList,
        RightComponent: CommonTable,
      };
    }
    return null;
  }
  return null;
};


// 改进配置blocks
export const imageSearchFormatList = [
  TOOL_PRODUCT_FORMAT,
  IMAGE_SEARCH_NORMAL_PRODUCT_FORMAT,
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  IMAGE_SEARCH_BUTTON_FORMAT,
  REVIEWED_PRODUCT_FORMAT,
  // IMAGE_SEARCH_ANALYSIS_PRODUCT_FORMAT,
  PLAIN_TEXT_FORMAT,
  IMAGE_SEARCH_REPORT_CARD_FORMAT,
  KEYWORD_SUMMARY_FORMAT,
  KEYWORD_IMAGE_SEARCH_SUMMARY,
  PRODUCT_MARKET_LIST_FORMAT,
  PRODUCT_MARKET_DETAIL_INFO_FORMAT,
  ...productFormatList,
  FOLLOW_UPS_FORMAT,
];
