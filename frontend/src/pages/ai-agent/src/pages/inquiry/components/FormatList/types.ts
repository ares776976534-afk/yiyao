// 询盘卡片类型定义
export type EnumInquiryCardType = 
  | 'MODULE'
  | 'MODULE_HEADER'
  | 'MARKDOWN_TEXT'
  | 'INQUIRY_REQUIREMENT'
  | 'INQUIRY_PROGRESS'
  | 'INQUIRY_REPORT';

export type EnumInquiryCardSubType =
  | 'MODULE_PREVIEW_START'
  | 'MODULE_PREVIEW_END';

export type EnumModuleStatus = 'IN_PROGRESS' | 'FINISHED';

// 基础卡片数据结构
export interface TypeInquiryCardBase {
  cardId: string;
  cardType: EnumInquiryCardType;
  cardSubType?: EnumInquiryCardSubType;
  eventType?: 'DATA_DISPLAY' | 'INQUIRY_REPORT';
  moduleName?: string;
  sessionId: string;
  taskId?: string;
  timestamp: number;
}

// MODULE_HEADER 卡片
export interface TypeModuleHeaderCard extends TypeInquiryCardBase {
  cardType: 'MODULE_HEADER';
  title: string;
  status: EnumModuleStatus;
}

// MARKDOWN_TEXT 卡片
export interface TypeMarkdownTextCard extends TypeInquiryCardBase {
  cardType: 'MARKDOWN_TEXT';
  markdownContent: string;
}

// INQUIRY_REQUIREMENT 卡片
export interface TypeInquiryRequirementCard extends TypeInquiryCardBase {
  cardType: 'INQUIRY_REQUIREMENT';
  title: string;
  detail: {
    imgUrl?: string;
    itemInfo?: {
      imgFileKey?: string;
    };
    supplierInfo?: Array<{
      wangwangId?: string;
      headImg?: string;
      companyName?: string;
      memberId?: string;
    }>;
    requirement?: {
      content: string;
      isOriginal: boolean;
    };
    inquiryQuestions?: string[];
    custom?: {
      expectedOrderQuantity?: number;
      address?: {
        code?: string;
        text?: string;
      };
    };
    showAutoOrder?: boolean;
    enableAutoOrderConfig?: boolean;
  };
}

// INQUIRY_PROGRESS 卡片
export interface TypeInquiryProgressCard extends TypeInquiryCardBase {
  cardType: 'INQUIRY_PROGRESS';
  title: string;
  finishTime?: string;
  detail: Array<{
    conversationId: string;
    companyName: string;
    wangwangId: string;
    buyerHeadImg?: string;
    sellerHeadImg?: string;
    messages: Array<{
      role: 'buyerAssistant' | 'buyer' | 'seller';
      content: string;
    }>;
    aiSummary?: string;
    progress?: string;
    questionProgress?: Array<{
      q: string;
      isFinished: boolean;
    }>;
  }>;
}

// INQUIRY_REPORT 卡片
export interface TypeInquiryReportCard extends TypeInquiryCardBase {
  cardType: 'INQUIRY_REPORT';
  eventType: 'INQUIRY_REPORT';
  detail: {
    isReport: boolean;
    tableHead?: Array<{
      key: string;
      cnKey: string;
    }>;
    taskInfo?: {
      img?: string;
      isAutoOrder?: boolean;
      questionNum?: number;
      supplierNum?: number;
      createTime?: string;
      finishTime?: string;
      status?: string;
      title?: string;
    };
    aiInsight?: Array<{
      cnKey: string;
      value: string;
    }>;
    aiSummary?: string;
    supplierCompare?: Array<{
      sellerInfo?: {
        companyName?: string;
        wangwangId?: string;
        isBest?: boolean;
        headImg?: string;
      };
      status?: string;
      progress?: string;
      inquiryAnswers?: Array<{
        key: string;
        value: string;
      }>;
      questionProgress?: Array<{
        q: string;
        isFinished: boolean;
      }>;
      conversationId?: string;
      inquiryTaskId?: string;
      orderId?: string | null;
    }>;
    autoOrderInfo?: any[];
  };
}

// 联合类型
export type TypeInquiryCard = 
  | TypeInquiryCardBase
  | TypeModuleHeaderCard
  | TypeMarkdownTextCard
  | TypeInquiryRequirementCard
  | TypeInquiryProgressCard
  | TypeInquiryReportCard;

