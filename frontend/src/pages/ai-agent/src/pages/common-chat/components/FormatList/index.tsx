import { UserInputText } from '@/pages/select-product/components/LeftComponents';
import {
  MODULE_FORMAT, PLAIN_TEXT_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
} from '@/pages/select-product/components/format';
import { ThinkingPlainText } from '@/pages/select-product/components/LeftComponents/ThinkingPlainText';
import ReportButton from '@/pages/select-product/general-agent/components/FormatList/ReportButton';
import ReportContent from '@/pages/select-product/general-agent/components/FormatList/ReportContent';
import WebSearchButton from './WebSearch/Button';
import WebSearchTable from './WebSearch/Table';
import { Markdown } from '@/components/ChatFlow/Markdown';
import { TooltipComponent } from '@/pages/select-product/components/RightComponents';

const IMPROVE_REPORT_CARD_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === 'CONSULT_REPORT_CARD') {
    const fileList = data?.fileList;

    const fileUrl = fileList?.pdf_file_url || fileList?.html_file_url;

    const handleExport = fileUrl ? () => {
      window.open(fileUrl);
    } : false;

    return {
      ...data,
      Tooltip: TooltipComponent,
      LeftComponent: ReportButton,
      RightComponent: ReportContent,
      onExportReport: handleExport,
    };
  }
  return null;
};

const USER_INPUT_PLAIN_TEXT_FORMAT = (data: any) => {
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

export const WEB_SEARCH_BUTTON_FORMAT = (data: any) => {
  if (data?.cardType === 'WEB_SEARCH') {
    return {
      ...data,
      LeftComponent: WebSearchButton,
      RightComponent: WebSearchTable,
    };
  }
  return null;
};

const MARKDOWN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === 'MARKDOWN_TEXT') {
    return {
      ...data,
      cardType: 'MARKDOWN_TEXT',
      text: data?.markdownContent,
      LeftComponent: Markdown,
    };
  }
  return null;
};


export default [
  MODULE_FORMAT,
  TASK_EXECUTION_BRIEF_FORMAT,
  IMPROVE_REPORT_CARD_FORMAT,
  USER_INPUT_PLAIN_TEXT_FORMAT,
  THINKING_PLAIN_TEXT_FORMAT,
  WEB_SEARCH_BUTTON_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  PLAIN_TEXT_FORMAT,
];