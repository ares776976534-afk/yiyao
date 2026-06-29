/**
 * 消息处理器类型定义
 *
 * 这个文件定义了消息处理器的核心接口和类型
 */

import { ROLE_CONSTANTS } from "../constants";
import type { TypeMediaItem, TypeBubbleState } from "../index.d";

export { TypePlanStep, TypePlanInfo, TypeBubbleState } from "../index.d";

/** 多图项 */
export interface TypeMultiImageItem {
  mediaIndex: number;
  startTime?: number;
  endTime?: number;
  queueWaitingEndTime?: number;
  media_item: TypeMediaItem | null;
  is_uncompleted: boolean;
  failed?: boolean;
}

/** 内容块类型 */
export interface TypeContentBlock {
  type: "text" | "design" | "multi_media";
  content: any;
}

/** 步骤卡片详情 */
export interface TypeStepCardDetail {
  type: "step_card";
  stepId: string | number;
  stepTitle: string;
  planId: string;
  is_uncompleted: boolean;
  contentBlocks: TypeContentBlock[];
}

/** 多图卡片详情 */
export interface TypeMultiMediaCardDetail {
  type: "multi_media";
  cardId: string;
  mediaNum: number;
  planId?: string;
  stepId?: string | number;
  contentType?: string;
  icon?: string;
  sessionId?: string;
  taskId?: string;
  is_uncompleted: boolean;
  multiImages: TypeMultiImageItem[];
}

/** 设计卡片详情 */
export interface TypeDesignCardDetail {
  type: "design";
  title?: string;
  icon?: string;
  contentType?: string;
  media_items?: TypeMediaItem[];
  is_uncompleted: boolean;
  failed?: boolean;
  startTime?: number;
  endTime?: number;
}

/** 通用卡片详情 */
export interface TypeCardDetail {
  type?: string;
  content?: any;
  is_uncompleted?: boolean;
  [key: string]: any;
}

/** 气泡数据 */
export interface TypeBubble {
  role:
    | typeof ROLE_CONSTANTS.USER
    | typeof ROLE_CONSTANTS.ASSISTANT
    | typeof ROLE_CONSTANTS.HEARTBEAT
    | typeof ROLE_CONSTANTS.TASK_END_STATUS;
  intent?: string;
  card_detail: TypeCardDetail;
  _bubbleId?: string;
}

/** 处理器上下文 - 提供处理器需要的所有依赖 */
export interface TypeHandlerContext {
  /** 气泡相关状态 */
  bubbleRef: React.MutableRefObject<TypeBubbleState>;

  /**
   * 触发气泡渲染
   * @param bubbles - 新的 bubbles 数组
   * @param options - 可选配置
   */
  setBubbles: (bubbles: any[]) => void;

  /** 设置会话名称 */
  setProjectName: (name: string) => void;

  /** 设置会话 ID */
  setSessionId: (sessionId: string) => void;

  /** 是否允许创建新会话 */
  setCreateDisabled: (disabled: boolean) => void;

  /** 合并非空字段 */
  mergeNonEmptyFields: (target: any, source: any) => any;

  /** 全局 store */
  store: any;

  /** 兜底图 */
  fallbackImage: string;

  /** 打字机效果处理（文本） */
  processTypingEffect?: (
    message: any,
    options: { speed?: number; step?: number },
    onChunk: (chunk: any) => void,
    onComplete: () => void,
  ) => void;

  /** 打字机效果处理（任务规划） */
  processPlanTypingEffect?: (
    message: any,
    options: { speed?: number; step?: number },
    onChunk: (chunk: any) => void,
    onComplete: () => void,
  ) => void;

  /** 设置输入框状态 */
  setStatus?: (status: any) => void;
  /** 输入框状态枚举 */
  InputStatus?: {
    DEFAULT: any;
    RUNNING: any;
    [key: string]: any;
  };
}

/** 处理器选项 */
export interface TypeHandlerOptions {
  /** 是否添加到画布 */
  addToCanvas?: boolean;
  /** 用户消息是否添加到画布（不传则跟 addToCanvas 一致） */
  addUserToCanvas?: boolean;
  /** 是否启用打字机效果 */
  typing?: boolean;
  /** 是否启用流式打字机效果 */
  streamTyping?: boolean;
  /** 打字机速度 */
  speed?: number;
  /** 打字机步长 */
  step?: number;
}

/** 消息处理器接口 */
export interface TypeMessageHandler {
  /** 处理的消息类型（支持单个或多个） */
  type: string | string[];
  /** 处理消息 */
  handle: (
    message: any,
    context: TypeHandlerContext,
    options?: TypeHandlerOptions,
  ) => void;
}

/** 处理器工厂函数类型 */
export type TypeHandlerFactory = (
  context: TypeHandlerContext,
) => TypeMessageHandler;
