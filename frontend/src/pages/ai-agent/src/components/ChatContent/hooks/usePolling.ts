/**
 * usePolling - Poll-Stream 模式的轮询 Hook
 *
 * 封装轮询逻辑，包括：
 * - 启动/停止轮询
 * - 超时控制（单次请求超时、总时长超时）
 * - 失败重试（连续失败次数限制）
 * - 动态间隔补偿（尽量保持 1s 间隔）
 */

import { useRef } from "react";
import { queryMessage } from "@/services";
import { POLL_CONSTANTS, COMPLETED_TASK_STATUS_CONSTANTS } from "../constants";
import type { TypePollingState } from "../index.d";
import type { TypeQueryMessageResult } from "@/services/studio/queryMessage";

/** 轮询回调 */
export interface TypePollingCallbacks {
  /** 收到消息时的回调 */
  onMessage?: (data: TypeQueryMessageResult) => void;
  /** 任务完成时的回调 */
  onComplete?: () => void;
  /** 轮询错误时的回调 */
  onError?: (error: any, failCount: number) => void;
  /** 单次请求超时时的回调 */
  onRequestTimeout?: () => void;
  /** 轮询总时长超时时的回调 */
  onDurationTimeout?: () => void;
  /** 连续失败次数超限时的回调 */
  onMaxFailuresReached?: () => void;
}

/** usePolling 返回值 */
export interface TypeUsePollingReturn {
  /** 轮询状态 ref */
  pollRef: React.MutableRefObject<TypePollingState>;
  /** 启动轮询 */
  startPolling: (sessionId: string, startEventId: number) => void;
  /** 停止轮询 */
  stopPolling: () => void;
  /** 是否正在轮询 */
  isPolling: () => boolean;
  /** 重置轮询状态 */
  resetPolling: () => void;
}

const createInitialPollingState = (): TypePollingState => ({
  timer: null,
  sessionId: "",
  startEventId: 0,
  failCount: 0,
  startTime: 0,
});

export default function usePolling(
  callbacks: TypePollingCallbacks = {},
): TypeUsePollingReturn {
  const pollRef = useRef<TypePollingState>(createInitialPollingState());
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const { POLL_INTERVAL, POLL_TIMEOUT, MAX_FAIL_COUNT, MAX_POLL_DURATION } =
    POLL_CONSTANTS;

  /**
   * 停止轮询（清除定时器）
   */
  const stopPolling = () => {
    if (pollRef.current.timer) {
      // console.log("【usePolling】停止轮询");
      clearTimeout(pollRef.current.timer);
      pollRef.current.timer = null;
    }
  };

  /**
   * 重置轮询状态
   */
  const resetPolling = () => {
    stopPolling();
    pollRef.current = createInitialPollingState();
  };

  /**
   * 判断是否正在轮询
   */
  const isPolling = () => pollRef.current.timer !== null;

  /**
   * 检查是否应该停止轮询
   */
  const checkShouldStopPolling = () => {
    const { onDurationTimeout, onMaxFailuresReached } = callbacksRef.current;
    // 1. 总时长超时，停止
    const elapsed = Date.now() - pollRef.current.startTime;
    if (elapsed > MAX_POLL_DURATION) {
      console.warn(
        `【usePolling】轮询总时长超时，强制停止, 总时长: ${elapsed}ms`,
      );
      onDurationTimeout?.();
      return true;
    }

    // 2. 连续失败太多次，停止
    if (pollRef.current.failCount >= MAX_FAIL_COUNT) {
      console.warn(
        `【usePolling】连续失败次数过多，停止轮询, 连续失败次数: ${pollRef.current.failCount}`,
      );
      onMaxFailuresReached?.();
      return true;
    }

    return false;
  };

  /**
   * 单次轮询
   */
  const poll = async () => {
    const { onMessage, onComplete, onError, onRequestTimeout } =
      callbacksRef.current;

    // 检查停止条件（超时、连续失败等异常情况）
    if (checkShouldStopPolling()) {
      stopPolling();
      onComplete?.();
      return;
    }

    const pollStartTime = Date.now();

    // 创建 AbortController 用于请求超时
    const controller = new AbortController();
    const abortTimeoutId = setTimeout(() => controller.abort(), POLL_TIMEOUT);

    try {
      const result = await queryMessage({
        sessionId: pollRef.current.sessionId,
        startEventId: pollRef.current.startEventId,
        signal: controller.signal,
      });

      if (result.success && result.data && result.data.nextEventId) {
        const { taskStatus, nextEventId } = result.data;

        // 检查任务是否完成
        if (COMPLETED_TASK_STATUS_CONSTANTS.includes(taskStatus)) {
          // console.log(
          //   `【usePolling】任务完成，停止轮询, taskStatus: ${taskStatus}`,
          // );
          stopPolling();
          onMessage?.(result.data);
          onComplete?.();
          return;
        }

        // 重置失败计数
        pollRef.current.failCount = 0;
        // 更新 startEventId
        pollRef.current.startEventId = nextEventId;

        // 回调：收到消息
        onMessage?.(result.data);
      } else {
        // 请求失败
        pollRef.current.failCount++;
        console.warn(
          `【usePolling】轮询失败 ${pollRef.current.failCount}/${MAX_FAIL_COUNT}:`,
          result,
        );
        onError?.(result, pollRef.current.failCount);
      }
    } catch (error) {
      pollRef.current.failCount++;
      if (error?.name === "AbortError") {
        console.warn("【usePolling】请求超时被取消");
        onRequestTimeout?.();
      }
      onError?.(error, pollRef.current.failCount);
      console.warn(
        `【usePolling】轮询异常 ${pollRef.current.failCount}/${MAX_FAIL_COUNT}:`,
        error,
      );
    } finally {
      clearTimeout(abortTimeoutId);

      // 继续下一次轮询（如果轮询未被停止）
      if (isPolling()) {
        const pollFinishTime = Date.now();
        const pollElapsed = pollFinishTime - pollStartTime;
        // 动态补偿：目标间隔 - 本次请求耗时，最小 0
        const nextDelay = Math.max(0, POLL_INTERVAL - pollElapsed);
        pollRef.current.timer = setTimeout(poll, nextDelay);
      }
    }
  };

  /**
   * 启动轮询
   */
  const startPolling = (sessionId: string, startEventId: number) => {
    // 每次开始轮询前重置轮询状态
    resetPolling();

    // console.log(
    //   `【usePolling】启动轮询, sessionId: ${sessionId}, startEventId: ${startEventId}`,
    // );

    pollRef.current.sessionId = sessionId;
    pollRef.current.startEventId = startEventId;
    pollRef.current.startTime = Date.now();

    // 立即开始第一次轮询
    pollRef.current.timer = setTimeout(poll, POLL_INTERVAL);
  };

  return {
    pollRef,
    startPolling,
    stopPolling,
    isPolling,
    resetPolling,
  };
}
