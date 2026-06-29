/**
 * 询盘相关类型定义
 */

// 询盘状态枚举
export enum EnumInquiryStatus {
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
}

// 卡片类型枚举
export enum EnumCardType {
  INQUIRY_REPORT = 'INQUIRY_REPORT',
}

// 事件类型枚举
export enum EnumEventType {
  DATA_DISPLAY = 'DATA_DISPLAY',
}

// AI 洞察项类型
export interface TypeAiInsightItem {
  cnKey: string;
  value: string;
}

// 询盘回答项类型
export interface TypeInquiryAnswer {
  key: string;
  value: string;
}

// 问题进度类型
export interface TypeQuestionProgress {
  isFinished: boolean;
  q: string;
}

// 卖家信息类型
export interface TypeSellerInfo {
  companyName: string;
  headImg: string;
  isBest: boolean;
  wangwangId: string;
}

// 供应商对比信息类型
export interface TypeSupplierCompare {
  conversationId: string;
  inquiryAnswers: TypeInquiryAnswer[];
  inquiryTaskId: string;
  progress: string;
  questionProgress: TypeQuestionProgress[];
  sellerInfo: TypeSellerInfo;
  status: EnumInquiryStatus | string;
}

// 表头类型
export interface TypeTableHead {
  cnKey: string;
  key: string;
}

// 任务信息类型
export interface TypeTaskInfo {
  createTime: string;
  finishTime: string;
  img: string;
  isAutoOrder: boolean;
  questionNum: number;
  status: EnumInquiryStatus | string;
  supplierNum: number;
  title: string;
}

// 自动下单信息类型（待补充）
export interface TypeAutoOrderInfo {
  // 根据实际数据结构补充
  [key: string]: any;
}

// 询盘报告详情类型
export interface TypeInquiryReportDetail {
  aiInsight: TypeAiInsightItem[];
  aiSummary: string;
  autoOrderInfo: TypeAutoOrderInfo[];
  isReport: boolean;
  supplierCompare: TypeSupplierCompare[];
  tableHead: TypeTableHead[];
  taskInfo: TypeTaskInfo;
}

// 询盘报告卡片类型
export interface TypeInquiryReportCard {
  cardId: string;
  cardType: EnumCardType | string;
  detail: TypeInquiryReportDetail;
  eventType: EnumEventType | string;
  needHide: boolean;
  requestId: string;
  sessionId: string;
  timestamp: number;
  title: string;
}

