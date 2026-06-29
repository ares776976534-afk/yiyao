export const GENERATION_CONSTANTS = {
  /** 空档阈值：超过这个时间没收到 token，标记进入空档（ms） */
  IDLE_THRESHOLD: 3000,

  /** 思考中最小显示时长：防止闪烁（ms） */
  MIN_THINKING_DISPLAY: 1000,
};

/** 轮询状态 */
export const POLL_CONSTANTS = {
  /** 轮询间隔（毫秒） */
  POLL_INTERVAL: 1000,
  /** 单次请求超时（毫秒） */
  POLL_TIMEOUT: 5000,
  /** 最大连续失败次数 */
  MAX_FAIL_COUNT: 3,
  /** 最大轮询时长 20 分钟 */
  MAX_POLL_DURATION: 1200000,
};

export const ROLE_CONSTANTS = {
  USER: "user" as const, // 用户角色
  ASSISTANT: "assistant" as const, // 助手角色
  HEARTBEAT: "heartbeat" as const, // 心跳角色
  TASK_END_STATUS: "taskEndStatus" as const, // 任务结束状态角色
};

export const BUBBLE_TYPE_CONSTANTS = {
  STEP_CARD: "step_card" as const,
};

export const MESSAGE_TYPE_CONSTANTS = {
  DESIGN: "design" as const, // 单图消息
  MULTI_MEDIA: "multi_media" as const, // 多图出框消息
  TEXT: "text" as const, // 文本消息
  SESSION: "session" as const, // 会话消息
  RESP: "resp" as const, // 响应消息
  INTENT: "intent" as const, // 意图消息
  USER: "USER" as const, // 用户消息
  ERROR: "error" as const, // 错误消息
  TEXT_STREAM: "text_stream" as const, // 流式文本消息
  DESIGN_ANALYZER: "design_analyzer" as const, // 图片理解分析消息
  MULTI_IMAGE: "multi_image" as const, // 多图消息
  MULTI_MEDIA_CONTENT: "multi_media_content" as const, // 多图内容消息
  PERCENT_LOADING: "percent_loading" as const, // 单图进度消息
  MULTI_PERCENT_LOADING: "multi_percent_loading" as const, // 多图进度消息
  PLAN: "plan" as const, // 任务规划消息
  PLAN_STATUS: "plan_status" as const, // 步骤状态消息
  PLAN_STREAM: "plan_stream" as const, // 流式任务规划消息
  STATUS_CHANGE: "statusChange" as const, // 状态变化消息
  KNOWLEDGE: "knowledge" as const, // 知识库消息
  IMAGE_CHOOSE: "imageChoose" as const, // 图片选择消息
  OFFER: "offer" as const, // 商品消息
  OFFER_PERCENT_LOADING: "offer_percent_loading" as const, // 商品进度消息
  ONE_CLICK_OPT_RESULT: "oneClickOptResult" as const, // 一键优化结果消息
  FINISH: "FINISH" as const, // 步骤状态消息
};

export const TASK_STATUS_CONSTANTS = {
  IDLE: "IDLE" as const, // 空闲，没有任务
  RUNNING: "RUNNING" as const, // 任务正在执行
  WAITING: "WAITING" as const, // 任务等待中（stopForWaiting）
  COMPLETED: "COMPLETED" as const, // 任务已完成（allDone）
  HUMAN: "HUMAN" as const, // 等待用户选择
  CANCELED: "CANCELED" as const, // 任务已取消
} as const;

// 任务完成状态
export const COMPLETED_TASK_STATUS_CONSTANTS = [
  TASK_STATUS_CONSTANTS.IDLE,
  TASK_STATUS_CONSTANTS.COMPLETED,
  TASK_STATUS_CONSTANTS.HUMAN,
  TASK_STATUS_CONSTANTS.CANCELED,
] as string[];

export const RUNNING_TASK_STATUS_CONSTANTS = [
  TASK_STATUS_CONSTANTS.RUNNING,
  TASK_STATUS_CONSTANTS.WAITING,
] as string[];

export const STATUS_CONSTANTS = {
  START: "start" as const, // 任务开始
  END: "end" as const, // 任务结束
  ALL_DONE: "allDone" as const, // 任务已完成（allDone）
  STOP_BY_USER: "stopByUser" as const, // 用户终止
  STOP_FOR_WAITING: "stopForWaiting" as const, // 等待中停止
  WAIT_FOR_USER: "waitForUser" as const, // 等待用户输入
  STOPPING: "STOPPING" as const, // 任务正在中断
};

export const CONTENT_TYPE_CONSTANTS = {
  IMAGE: "image" as const, // 图片类型
  VIDEO: "video" as const, // 视频类型
  MEDIA: "media" as const, // 媒体类型
  LINK: "link" as const, // 链接类型
};

export default {
  ROLE_CONSTANTS,
  BUBBLE_TYPE_CONSTANTS,
  MESSAGE_TYPE_CONSTANTS,
  TASK_STATUS_CONSTANTS,
  CONTENT_TYPE_CONSTANTS,
};
