import { useState, useEffect, useRef, useCallback } from "react";
import { GENERATION_CONSTANTS } from "../constants";

/**
 * 最小显示时长保护（内部使用）
 * 一旦显示，至少保持显示一段时间，防止刚显示就隐藏导致闪烁
 */
function useMinDisplayDuration(shouldShow: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const showStartTimeRef = useRef<number | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 用 ref 存储最新的 shouldShow 值，供定时器回调使用
  const shouldShowRef = useRef(shouldShow);
  shouldShowRef.current = shouldShow;

  useEffect(() => {
    if (shouldShow && !visible) {
      setVisible(true);
      showStartTimeRef.current = Date.now();

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    } else if (!shouldShow && visible) {
      const showDuration = Date.now() - (showStartTimeRef.current || 0);
      const remaining =
        GENERATION_CONSTANTS.MIN_THINKING_DISPLAY - showDuration;

      if (remaining <= 0) {
        setVisible(false);
        showStartTimeRef.current = null;
      } else {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        hideTimerRef.current = setTimeout(() => {
          // 定时器到期时再次检查 shouldShow 的最新值
          // 如果已经变成 true 了，就不隐藏
          if (!shouldShowRef.current) {
            setVisible(false);
            showStartTimeRef.current = null;
          }
          hideTimerRef.current = null;
        }, remaining);
      }
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [shouldShow, visible]);

  // 关键修复：如果 shouldShow 是 false，直接返回 false
  // 避免 React state 批量更新过程中的中间状态导致闪烁
  return shouldShow ? visible : false;
}

export interface TypeUseHeartbeatReturn {
  /** 实际是否显示心跳（带最小显示时长保护） */
  heartbeatVisible: boolean;
  /**
   * 收到内容消息时调用
   * - 立即隐藏思考中
   * - 启动空档定时器，超时后再次显示
   */
  onContentReceived: () => void;
  /**
   * 结束生成时调用
   * - 立即隐藏思考中
   * - 清除所有定时器
   */
  endGeneration: () => void;
}

/**
 * 心跳显示控制 Hook
 *
 * 核心逻辑：
 * 1. 调用方通过 onContentReceived 通知"收到内容"
 * 2. 收到内容后隐藏思考中，同时启动空档定时器
 * 3. 超过 IDLE_THRESHOLD 没有新内容，再次显示思考中
 * 4. 显示后至少保持 MIN_THINKING_DISPLAY 时长，防止闪烁
 * 5. 调用 endGeneration 可立即结束并清理所有状态
 *
 * @param isBlocked - 是否被阻塞（如正在停止、有 loading 气泡等），阻塞时不显示心跳
 * @returns 心跳控制对象
 *
 * @example
 * ```tsx
 * const { heartbeatVisible, onContentReceived, endGeneration } = useHeartbeat(
 *   isStopping || hasLoadingBubble(bubbles)
 * );
 *
 * // 在 useLayoutEffect 中监听 bubbles 变化
 * useLayoutEffect(() => {
 *   if (status === Status.RUNNING && isAIMessage(lastBubble)) {
 *     onContentReceived();
 *   }
 * }, [bubbles, status, onContentReceived]);
 *
 * // 组件卸载或任务结束时清理
 * useEffect(() => {
 *   return () => endGeneration();
 * }, []);
 * ```
 */
export default function useHeartbeat(
  isBlocked: boolean,
): TypeUseHeartbeatReturn {
  const [shouldShow, setShouldShow] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const onContentReceived = useCallback(() => {
    setShouldShow(false);
    clearIdleTimer();

    idleTimerRef.current = setTimeout(() => {
      setShouldShow(true);
      idleTimerRef.current = null;
    }, GENERATION_CONSTANTS.IDLE_THRESHOLD);
  }, [clearIdleTimer]);

  const endGeneration = useCallback(() => {
    setShouldShow(false);
    clearIdleTimer();
  }, [clearIdleTimer]);

  useEffect(() => {
    return clearIdleTimer;
  }, [clearIdleTimer]);

  const shouldShowThinking = shouldShow && !isBlocked;
  const heartbeatVisible = useMinDisplayDuration(shouldShowThinking);


  return {
    heartbeatVisible,
    onContentReceived,
    endGeneration,
  };
}
