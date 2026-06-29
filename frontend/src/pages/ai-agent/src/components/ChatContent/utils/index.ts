import { routeJump, replaceUrlSearchParams } from "@/utils/url";
import { MESSAGE_TYPE_CONSTANTS } from "../constants";
export { materialBaseAPIUrl } from "@/utils/env";
export { checkAuthAndLogin } from "@/utils/login";
export { routeJump, replaceUrlSearchParams };
export {
  markDesignAsFailed,
  markMultiMediaAsFailed,
  markAllUncompletedAsFailed,
  insertStepCardInOrder,
  hasLoadingBubble,
  createInitialBubbleState,
} from "../handlers/handlerUtils";
export { default as debugLogger } from "./debugLogger";

// 计算百分比的工具函数
export const calculatePercent = (
  startTime: number,
  endTime: number,
  now?: number,
): number => {
  const currentTime = now ?? Date.now();

  if (!startTime || !endTime) {
    return 0;
  }

  // 如果已经到了预期结束时间，显示 99%
  if (currentTime >= endTime) {
    return 99;
  }

  // 计算百分比: (当前时间 - 起始时间) / (结束时间 - 起始时间) * 100
  const percent = ((currentTime - startTime) / (endTime - startTime)) * 100;

  // 确保百分比在 0-99 之间
  return Math.max(0, Math.min(99, Math.floor(percent)));
};

interface TypeProgressParams {
  is_uncompleted?: boolean;
  startTime?: number;
  endTime?: number;
  queueWaitingEndTime?: number;
  /** 可选的当前时间戳，用于批量计算时共享同一个时间点 */
  now?: number;
}

interface TypeProgressState {
  isInQueue: boolean;
  // isTimeout: boolean;
  queueWaitingSeconds: number;
  generateRemainingSeconds: number;
  // percent: number | null;
}

/**
 * 计算进度状态（排队/生成/超时）
 * 统一入口函数，一次计算返回所有状态
 * @param params.now 可选，传入时间戳可避免多次调用 Date.now()，适合批量计算场景
 */
export const getProgressState = (
  params: TypeProgressParams,
): TypeProgressState => {
  const {
    is_uncompleted = true,
    // startTime,
    endTime,
    queueWaitingEndTime,
    now: nowParam,
  } = params;
  const now = nowParam ?? Date.now();

  // 判断是否在排队阶段
  const isInQueue =
    is_uncompleted && !!queueWaitingEndTime && now < queueWaitingEndTime;

  // // 判断是否超时
  // const isTimeout = (() => {
  //   if (!is_uncompleted || !endTime) return false;
  //   if (queueWaitingEndTime && now < queueWaitingEndTime) return false;
  //   return now >= endTime;
  // })();

  // 计算排队剩余时间（秒）
  const queueWaitingSeconds = (() => {
    if (!isInQueue || !queueWaitingEndTime) return 0;
    const remainingMs = queueWaitingEndTime - now;
    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / 1000);
  })();

  // 计算生成剩余时间（秒），超时时返回 0（统一显示"生成中，约0秒"）
  const generateRemainingSeconds = (() => {
    if (isInQueue || !is_uncompleted || !endTime) return 0;
    const remainingMs = endTime - now;
    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / 1000);
  })();

  // // 计算进度百分比
  // const percent = (() => {
  //   if (!is_uncompleted) return 100;
  //   if (isInQueue) return null;
  //   if (isTimeout) return 99;
  //   return calculatePercent(startTime || 0, endTime || 0, now);
  // })();

  return {
    isInQueue,
    // isTimeout,
    queueWaitingSeconds,
    generateRemainingSeconds,
    // percent,
  };
};

/**
 * 格式化剩余时间：超过60秒显示分钟，否则显示秒
 * @param seconds 剩余秒数
 * @returns { value: number, unit: 'minute' | 'second' }
 */
export const formatRemainingTime = (
  seconds: number,
): { value: number; unit: "minute" | "second" } => {
  if (seconds >= 60) {
    return { value: Math.ceil(seconds / 60), unit: "minute" };
  }
  return { value: seconds, unit: "second" };
};

/**
 * 获取进度阶段的 i18n 文案（排队/生成 × 分钟/秒）
 * @param isInQueue 是否处于排队阶段
 * @param queueWaitingSeconds 排队剩余秒数
 * @param generateRemainingSeconds 生成剩余秒数
 * @param $t i18n 翻译函数
 */
export const getProgressText = (
  isInQueue: boolean,
  queueWaitingSeconds: number,
  generateRemainingSeconds: number,
  $t: (key: string, defaultText: string, params?: any[]) => string,
): string => {
  if (isInQueue) {
    const time = formatRemainingTime(queueWaitingSeconds);
    return time.unit === "minute"
      ? $t(
          "global-1688-ai-app.ChatContent.content.bubbles.design.queueWaiting",
          `排队中，约${time.value}分钟`,
          [time.value],
        )
      : $t(
          "global-1688-ai-app.ChatContent.content.bubbles.design.queueWaitingSeconds",
          `排队中，约${time.value}秒`,
          [time.value],
        );
  }
  const time = formatRemainingTime(generateRemainingSeconds);
  return time.unit === "minute"
    ? $t(
        "global-1688-ai-app.ChatContent.content.bubbles.design.generateTimeMinutes",
        `生成中，约${time.value}分钟`,
        [time.value],
      )
    : $t(
        "global-1688-ai-app.ChatContent.content.bubbles.design.generateTime",
        `生成中，约${time.value}秒`,
        [time.value],
      );
};

// 创建一个过滤空值的合并函数
export const mergeNonEmptyFields = (target: any, source: any) => {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    // 只有当值不为空、不为undefined、不为空字符串时才更新
    if (value !== null && value !== undefined && value !== "") {
      result[key] = value;
    }
  }

  return result;
};

/**
 * 清空所有输入框相关的 URL 参数
 */
export const clearInputUrlParams = () => {
  replaceUrlSearchParams({
    cacheId: "",
    share: "",
    keyword: "",
    images: "",
    offerIds: "",
    autoSend: "",
  });
};

// 返回首页
export const backHome = () => {
  routeJump("/");
};

// 创建新会话
export const createNewSession = () => {
  // 更新url后刷新页面
  const url = new URL(window.location.href);
  url.searchParams.delete("sessionId");
  window.location.href = url.toString();
};

// 切换到当前会话
export const onSelect = (optSessionId: string) => {
  // 切换会话后重新请求历史记录
  const url = new URL(window.location.href);
  url.searchParams.set("sessionId", optSessionId);
  window.location.href = url.toString();
};

/**
 * 判断是否为需要按 cardId 去重的 design_analyzer 流式消息
 * 只有 design_analyzer + contentType=text_stream 会先推占位再推最终内容，需要去重
 */
const isDeduplicatable = (msg: any): boolean => {
  const { type, contentType, cardId } = msg;
  return (
    !!cardId &&
    type === MESSAGE_TYPE_CONSTANTS.DESIGN_ANALYZER &&
    contentType === MESSAGE_TYPE_CONSTANTS.TEXT_STREAM
  );
};

export const deduplicateStreamMessages = (messages: any[]): any[] => {
  const seenCardIds = new Set<string>();
  const result: any[] = [];

  // 倒序遍历，优先保留后面的（最终态）
  for (let idx = messages.length - 1; idx >= 0; idx--) {
    const msg = messages[idx];

    if (isDeduplicatable(msg)) {
      if (seenCardIds.has(msg.cardId)) {
        continue;
      }
      seenCardIds.add(msg.cardId);
    }

    result.push(msg);
  }

  return result.reverse();
};
