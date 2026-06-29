// 历史详情页相关类型定义
import React from 'react';

export interface TypeSellerInfo {
  companyName: string;
  headImg: string;
  isBest: boolean;
  wangwangId: string;
}

export interface TypeInquiryAnswer {
  key: string;
  value: string;
}

export interface TypeQuestionProgress {
  q: string;
  isFinished: boolean;
}

export interface TypeSupplierCompare {
  conversationId: string;
  inquiryAnswers: TypeInquiryAnswer[];
  inquiryTaskId: string;
  progress: string;
  questionProgress: TypeQuestionProgress[];
  sellerInfo: TypeSellerInfo;
  status: string;
  orderId?: string;
}

export interface TypeTableHead {
  key: string;
  cnKey: string;
}

export interface TypeActionButton {
  text: string;
  type: 'primary' | 'default';
  onClick?: (record: any) => void;
}

export interface TypeProcessedInquiryAnswer {
  inquiryAnswers: any[];
  sellerInfo: TypeSellerInfo;
  progress: string;
  answers: string[];
  actions: TypeActionButton[];
  questionProgress: any[];
}

export interface TypeAiInsight {
  cnKey: string;
  value: string;
}

export interface TypeTaskInfo {
  status: string;
  img: string;
  createTime: string;
  finishTime?: string;
  title: string;
  isAutoOrder?: boolean;
}

export interface TypeSupplierComparisonData {
  tableHead?: TypeTableHead[];
  supplierCompare?: TypeSupplierCompare[];
  taskInfo?: TypeTaskInfo;
  aiInsight?: TypeAiInsight[];
  aiSummary?: string;
  autoOrderInfo?: any[];
}

export interface TypeApiResponse {
  success: boolean;
  data: TypeSupplierComparisonData;
  msg: string;
}

export interface TypeSummaryData {
  overview?: string;
  coreContent?: string;
}

export interface TypeProcessSupplierDataResult {
  tableHead: string[];
  inquiryAnswers: TypeProcessedInquiryAnswer[];
}

// Antd Table Column 类型
export interface TypeTableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right' | boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}
