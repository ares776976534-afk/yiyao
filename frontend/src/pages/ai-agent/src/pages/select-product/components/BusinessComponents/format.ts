import { MARKDOWN_TEXT_FORMAT, MODULE_FORMAT, PLAIN_TEXT_FORMAT, TASK_EXECUTION_BRIEF_FORMAT } from '../format';
import { Footer } from './BusinessReport';
import { BusinessReportBoard } from '../BusinessComponents';

/** ******************* 选商 ******************** */
const BUSINESS_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === 'REPORT_CARD') {
    return {
      ...data,
      LeftComponent: Footer,
      RightComponent: BusinessReportBoard,
    };
  }
  return null;
};

export const businessFormatList = [
  MODULE_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  BUSINESS_REPORT_CARD_FORMAT,
  PLAIN_TEXT_FORMAT,
];
