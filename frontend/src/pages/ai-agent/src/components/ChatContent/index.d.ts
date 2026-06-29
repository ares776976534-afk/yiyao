import { TASK_STATUS_CONSTANTS } from "./constants";

export interface BubuleItem {
  key: string;
  role: string;
  content: any;
  footer?: any;
}

export type BubuleGroup = BubuleItem[];

export enum ProcessStatus {
  DEFAULT = "default",
  PROCESSING = "processing",
  PAUSED = "paused",
  COMPLETED = "completed",
}

export interface TypeChatProps {
  logMaps?: {
    send?: string;
    enhanced?: string;
    uploadimg?: string;
    uploaditemurl?: string;
    share?: string;
    history?: string;
    copyurl?: string;
    newtask?: string;
    listingview?: string;
  };
  typing?: boolean;
  streamTyping?: boolean; // 流式打字机效果
  planStreamTyping?: boolean;
  historyTyping?: boolean;
  step?: number;
  speed?: number;
  isShared?: boolean;
  shareCode?: string;
  className?: string;
  isMobile?: boolean;
  contentContainerClassName?: string;
  headerRender?: (props: any) => React.ReactNode;
  onSessionChange?: (id: string) => void;
  onCollapseChange?: (collapsed: boolean, curWidth: number) => void;
  onShareStatusChange?: (status: ProcessStatus) => void;
  onShareMessage?: (arg: any) => void;
}

export interface HistoryItem {
  sessionId: string;
  title: string;
  createdTime: number | string;
  sessionImage: string;
}

export interface TypeTypingOptions {
  speed?: number;
  step?: number;
}

export interface TypeMessage {
  type: string;
  content: string;
  [key: string]: any;
}

export interface TypeHandlerMap {
  type: string;
  handler: (message: TypeMessage) => void;
}

export interface TypeMultiImageItem {
  mediaIndex: number;
  percent: number;
  media_item: any | null;
  is_uncompleted: boolean;
}

export interface TypeMediaItem {
  height: number;
  media_cover_url: string;
  media_id: string;
  media_type: string;
  media_url: string;
  width: number;
}

export interface TypeDesignContent {
  // 原有字段
  sessionId: string;
  taskId: string;
  title: string;
  media_items?: TypeMediaItem[];
  icon?: string;
  is_uncompleted?: boolean;
  percent?: number;
  desc?: string;
  contentType?: string;

  // 新增多图字段
  cardId?: string;
  mediaNum?: number;
  multiImages?: TypeMultiImageItem[];
  planId?: string;
  stepId?: number;
}

export interface TypeTextContent {
  content: string;
  contentType?: string;
  is_uncompleted: boolean;
  messageType: string;
  sessionId: string;
  taskId: string;
  type: string;
}

export interface TypePlanStreamContent {
  is_uncompleted: boolean;
  content: {
    title: string;
    description: string;
  }[];
  contentType: string;
  icon: string;
  sessionId: string;
  taskId: string;
  title: string;
  type: string;
}

export interface TypeTextStreamItem {
  is_uncompleted: boolean;
  content: string;
  contentType: string;
  sessionId: string;
  taskId: string;
  type: string;
}

export interface TypeMultiImageItem {
  icon: string;
  cardId: string;
  mediaIndex: number;
  planId: string;
  sessionId: string;
  stepId: number;
  taskId: string;
  type: string;
}

/** 任务相关状态 */
export interface TypeTaskState {
  taskStatus:
    | typeof TASK_STATUS_CONSTANTS.IDLE
    | typeof TASK_STATUS_CONSTANTS.RUNNING
    | typeof TASK_STATUS_CONSTANTS.WAITING
    | typeof TASK_STATUS_CONSTANTS.COMPLETED
    | typeof TASK_STATUS_CONSTANTS.HUMAN
    | typeof TASK_STATUS_CONSTANTS.CANCELED;
  latestIds: {
    eventId: string | null;
    taskId: string | null;
    sessionId: string | null;
  };
}

/** Plan 步骤信息 */
export interface TypePlanStep {
  stepId: number | string;
  stepTitle: string;
  displayTitle?: string;
  displayContent?: string;
  agentName?: string;
}

/** Plan 信息 */
export interface TypePlanInfo {
  planId: string;
  stepNum: number;
  steps: TypePlanStep[];
}

/** 气泡相关状态 */
export interface TypeBubbleState {
  /** 气泡数据源 */
  data: any[];
  /**
   * 通用气泡索引映射
   * - 单步骤：cardId -> bubbleIndex（所有带 cardId 的消息）
   * - 多步骤：`${planId}_${stepId}` -> bubbleIndex（步骤卡片）
   */
  bubbleIdMap: Map<string, number>;
  /** 当前 plan 信息 */
  currentPlan: TypePlanInfo | null;
  /** 当前意图（用于判断闲聊等场景） */
  currentIntent: string;
}

/**
 * Poll-Stream
 *
 */
export interface TypePollingState {
  /** 轮询定时器（null = 未轮询，可通过此判断是否在轮询中） */
  timer: NodeJS.Timeout | null;
  /** 会话 ID */
  sessionId: string;
  /** 下次轮询的起始 eventId（核心：告诉后端「从哪条消息开始返回」） */
  startEventId: number;
  /** 连续失败次数（容错：防止网络异常时无限重试） */
  failCount: number;
  /** 轮询开始时间戳（兜底：超时强制停止，防止任务卡死） */
  startTime: number;
}
