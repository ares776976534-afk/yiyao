import { Markdown } from '@/components/ChatFlow/Markdown';
import { STREAMING_SPEEDS } from '@/pages/select-product/config';
import { InquiryCard } from './LeftComponents';
import AutoTriggerRightPanel from './LeftComponents/AutoTriggerRightPanel';
import ModuleHeader from './LeftComponents/ModuleHeader';
import { InquiryRequirementForm, ReportContent } from './RightComponents';
import InquiryProgress from '../inquiry-progress';
import CountdownTimer from './CountdownTimer';
import InquiryTaskDuration from './InquiryTaskDuration';
import { $t } from '@/i18n';
import './index.css';

// MODULE 格式化 - 模块容器
// cardType: MODULE
// cardSubType: MODULE_PREVIEW_START | MODULE_PREVIEW_END
const MODULE_FORMAT = (data: any) => {
  if (data?.cardType === 'MODULE') {
    return {
      ...data,
      accordionContent: [],
    };
  }
  return null;
};


// MARKDOWN_TEXT 格式化 - Markdown 文本
// cardType: MARKDOWN_TEXT
// cardSubType: 无
const MARKDOWN_TEXT_FORMAT = (data: any) => {
  if (data?.cardType === 'MARKDOWN_TEXT') {
    return {
      ...data,
      cardType: 'MARKDOWN_TEXT',
      text: data?.markdownContent,
      chunkIntervalMs: STREAMING_SPEEDS.NORMAL,
      streamGranularity: 'char',
      LeftComponent: Markdown,
      textColor: '#7C7F9A', // inquiry 页面定制色号
    };
  }
  return null;
};

// MODULE_HEADER 格式化 - 模块头部
// cardType: MODULE_HEADER
// cardSubType: 无
const MODULE_HEADER_FORMAT = (data: any) => {
  if (data?.cardType === 'MODULE_HEADER') {
    // 如果 status 是 ERROR，不推入 blocks 队列
    if (data?.status === 'ERROR') {
      return null;
    }
    return {
      ...data,
      LeftComponent: ModuleHeader,
    };
  }
  return null;
};

// INQUIRY_REQUIREMENT 格式化 - 询盘需求卡片
// cardType: INQUIRY_REQUIREMENT
// cardSubType: 无
const INQUIRY_REQUIREMENT_FORMAT = (data: any, blocks: any[]) => {
  if (data?.cardType === 'INQUIRY_REQUIREMENT') {
    // 当收到 INQUIRY_REQUIREMENT 时，找到模块内之前的 MARKDOWN_TEXT 并标记为隐藏
    // 因为 cardId 不同，无法通过 useChatStream 自动替换，需要手动处理
    // const currentModuleId = data.moduleName || '';
    // // 注意：这里直接修改 blocks 数组，因为 useChatStream 会处理更新
    // blocks.forEach((block) => {
    //   if (block.cardType === 'MODULE' && block.moduleName === currentModuleId && block.accordionContent) {
    //     block.accordionContent.forEach((content: any) => {
    //       if (content.cardType === 'MARKDOWN_TEXT') {
    //         // eslint-disable-next-line no-param-reassign
    //         content.hide = true; // 标记为隐藏
    //       }
    //     });
    //   }
    // });

    // 判断 detail 是否为空
    // 如果 detail 不存在或 detail 的关键字段都为空，则为第一次，需要用户填写（非只读）
    // 如果 detail 有值，则为第二次，需要回填并只读
    const hasDetail = !!(data?.detail && (
      (data.detail.supplierInfo && data.detail.supplierInfo.length > 0) ||
      data.detail.itemInfo?.imgFileKey ||
      data.detail.itemInfo?.offerId ||
      data.detail.requirement?.content ||
      (data.detail.inquiryQuestions && (
        (data.detail.inquiryQuestions.prebuild && data.detail.inquiryQuestions.prebuild.length > 0) ||
        (data.detail.inquiryQuestions.custom && data.detail.inquiryQuestions.custom.length > 0)
      ))
    ));
    const readonly = hasDetail; // 有值则只读，无值则可编辑

    // 无论是否有 detail，都需要显示右侧面板（第一次需要填写，第二次需要回填显示）
    // const shouldShowRightPanel = true;

    // 调试日志
    // console.log('[INQUIRY_REQUIREMENT_FORMAT]', {
    //   cardId: data?.cardId,
    //   hasDetail,
    //   shouldShowRightPanel,
    //   detail: data?.detail,
    // });

    return {
      ...data,
      // 根据是否有 detail 决定使用哪个组件：
      // - detail 为空时：使用 AutoTriggerRightPanel（不显示左侧卡片，只触发右侧面板）
      // - detail 有值时：使用 InquiryCard（显示左侧卡片和右侧面板）
      // LeftComponent: hasDetail ? InquiryCard : AutoTriggerRightPanel,
      LeftComponent: InquiryCard,
      // 自动拉起右侧表单：总是自动拉起（第一次需要填写，第二次需要回填显示）
      // shouldShowRightPanel,
      SlotTitle: InquiryTaskDuration,
      rightSideType: 'INQUIRY_REQUIREMENT_FORM',
      RightComponent: InquiryRequirementForm,
      // 标记是否只读：detail 为空时为 false（可编辑），有值时为 true（只读）
      readonly,
    };
  }
  return null;
};

// INQUIRY_PROGRESS 格式化 - 询盘进展卡片
// cardType: INQUIRY_PROGRESS
// cardSubType: 无
const INQUIRY_PROGRESS_FORMAT = (data: any) => {
  if (data?.cardType === 'INQUIRY_PROGRESS') {
    return {
      ...data,
      LeftComponent: InquiryCard,
      // shouldShowRightPanel: true,
      SlotTitle: CountdownTimer,
      rightSideType: 'INQUIRY_PROGRESS',
      RightComponent: InquiryProgress,
    };
  }
  return null;
};

// INQUIRY_REPORT 格式化 - 询盘报告卡片
// cardType: INQUIRY_REPORT
// cardSubType: 无
// 注意：此卡片类型的 eventType 是 'INQUIRY_REPORT'，不是 'DATA_DISPLAY'
const INQUIRY_REPORT_FORMAT = (data: any) => {
  // 也支持 cardType 为 INQUIRY_REPORT 的情况
  if (data?.cardType === 'INQUIRY_REPORT') {
    return {
      ...data,
      LeftComponent: InquiryCard,
      // shouldShowRightPanel: true,
      subtitle: $t("global-1688-ai-app.inquiry.FormatList.exportReport", "导出报告"),
      rightSideType: 'REPORT_CONTENT',
      RightComponent: ReportContent,
    };
  }
  return null;
};

// 询盘格式化函数列表（按处理顺序）
const inquiryFormatList = [
  MODULE_FORMAT,
  MODULE_HEADER_FORMAT,
  MARKDOWN_TEXT_FORMAT,
  INQUIRY_REQUIREMENT_FORMAT,
  INQUIRY_PROGRESS_FORMAT,
  INQUIRY_REPORT_FORMAT,
];

export default inquiryFormatList;