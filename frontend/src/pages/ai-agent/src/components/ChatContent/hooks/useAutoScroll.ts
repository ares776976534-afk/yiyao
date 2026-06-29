import { useRef, useEffect, useCallback } from "react";

interface TypeAutoScrollOptions {
  /** 恢复自动滚动的延迟时间（毫秒） */
  resumeDelay?: number;
}

/**
 * 自动滚动控制 Hook
 *
 * 用户交互（滚轮、触摸）后暂停自动滚动，一段时间无操作后恢复
 */
export default function useAutoScroll(
  contentRef: React.RefObject<any>,
  options: TypeAutoScrollOptions = {},
) {
  const { resumeDelay = 3000 } = options;

  const autoScrollEnabledRef = useRef<boolean>(true);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 暂停自动滚动
  const pauseAutoScroll = useCallback(() => {
    autoScrollEnabledRef.current = false;

    // 清除之前的定时器
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    // 启动恢复定时器
    resumeTimerRef.current = setTimeout(() => {
      autoScrollEnabledRef.current = true;
      resumeTimerRef.current = null;
    }, resumeDelay);
  }, [resumeDelay]);

  const enableAutoScroll = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    autoScrollEnabledRef.current = true;
  }, []);

  // 检查是否启用自动滚动
  const isAutoScrollEnabled = useCallback(() => {
    return autoScrollEnabledRef.current;
  }, []);

  // 监听用户交互事件
  useEffect(() => {
    const contentEl = contentRef.current?.nativeElement;

    if (!contentEl) return;

    const handleUserInteraction = () => {
      pauseAutoScroll();
    };

    // 监听滚轮、触摸事件
    contentEl.addEventListener("wheel", handleUserInteraction, {
      passive: true,
    });
    contentEl.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    });
    contentEl.addEventListener("touchmove", handleUserInteraction, {
      passive: true,
    });

    return () => {
      contentEl.removeEventListener("wheel", handleUserInteraction);
      contentEl.removeEventListener("touchstart", handleUserInteraction);
      contentEl.removeEventListener("touchmove", handleUserInteraction);

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [contentRef, pauseAutoScroll]);

  return {
    /** 是否启用自动滚动 */
    isAutoScrollEnabled,
    /** 暂停自动滚动（用户交互时自动调用） */
    pauseAutoScroll,
    /** 强制启用自动滚动 */
    enableAutoScroll,
  };
}
