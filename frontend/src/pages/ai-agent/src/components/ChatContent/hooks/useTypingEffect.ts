import { useRef, useCallback, useState } from "react";
import {
  ProcessStatus,
  TypeMessage,
  TypeTypingOptions,
  TypeHandlerMap,
} from "../index.d";

export default function useTypingEffect() {
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [processStatus, setProcessStatus] = useState<ProcessStatus>(
    ProcessStatus.DEFAULT,
  );

  // 队列处理状态管理
  const state = useRef<{
    isProcessing: boolean;
    isPaused: boolean;
    currentIndex: number;
    isTextTyping: boolean;
    isPlanTyping: boolean;
    typingCurIndex: number;
    messageQueue: TypeMessage[];
    handlerMap: Map<string, (message: TypeMessage) => void>;
    handlerMaps: TypeHandlerMap[];
    onComplete?: (data: any) => void;
    processNextMessage?: () => void;
    typeText?: () => void;
    typePlan?: () => void;
    currenttitleIndex: number;
    currentDescriptionIndex: number;
    currentItemIndex: number;
    disableTyping: boolean;
  }>({
    // 队列正在处理中
    isProcessing: false,
    // 队列是否暂停
    isPaused: false,
    // 记录当前流式处理到哪一条
    currentIndex: 0,
    // 是否正在打字
    isTextTyping: false,
    // 当前打字索引
    typingCurIndex: 0,
    // 消息队列
    messageQueue: [],
    handlerMap: new Map(),
    handlerMaps: [],
    onComplete: undefined,
    processNextMessage: undefined,
    typeText: undefined,
    typePlan: undefined,
    isPlanTyping: false,
    currenttitleIndex: 0,
    currentDescriptionIndex: 0,
    // 当前处理的数组索引
    currentItemIndex: 0,
    // 手动禁用打字机效果，实现直接跳转到结果
    disableTyping: false,
  });

  const resetState = () => {
    // 重置状态
    state.current = {
      // 队列正在处理中
      isProcessing: false,
      // 队列是否暂停
      isPaused: false,
      // 记录当前流式处理到哪一条
      currentIndex: 0,
      // 是否正在打字
      isTextTyping: false,
      isPlanTyping: false,
      // 当前打字索引
      typingCurIndex: 0,
      // 消息队列
      messageQueue: [],
      // 处理后的事件map
      handlerMap: new Map(),
      handlerMaps: [],
      onComplete: undefined,
      processNextMessage: undefined,
      typeText: undefined,
      typePlan: undefined,
      currenttitleIndex: 0,
      currentDescriptionIndex: 0,
      // 当前处理的数组索引
      currentItemIndex: 0,
      disableTyping: false,
    };
  };

  // 清理定时器
  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  // 打字机效果处理函数
  const processTypingEffect = useCallback(
    (
      message: TypeMessage,
      options: TypeTypingOptions = { speed: 50, step: 5 },
      onProgress: (chunk: TypeMessage) => void,
      onComplete: () => void,
    ) => {
      const { content = "" } = message;
      const { speed = 50, step = 5 } = options;

      // 如果没有内容，直接完成
      if (!content) {
        onComplete();
        return;
      }

      // 清理之前的定时器
      clearTypingTimer();

      // 开始打字机效果
      state.current.isTextTyping = true;
      state.current.typingCurIndex = 0;

      const typeText = () => {
        const currentCharIndex = state.current.typingCurIndex;
        if (state.current.isPaused) {
          return;
        }

        if (state.current.disableTyping) {
          // 直接返回所有剩余的内容，进入下一条
          const typingChunk = {
            ...message,
            content: content.slice(currentCharIndex),
          };
          onProgress(typingChunk);
          state.current.isTextTyping = false;
          state.current.typingCurIndex = 0;
          if (state.current.processNextMessage) {
            state.current?.processNextMessage();
          }
          return;
        }

        if (currentCharIndex < content.length) {
          const charToAdd = content.slice(
            currentCharIndex,
            currentCharIndex + step,
          );

          // 创建包含当前字符的消息片段
          const typingChunk = {
            ...message,
            content: charToAdd,
          };

          // 调用进度回调
          onProgress(typingChunk);

          state.current.typingCurIndex += step;

          // 递归调用，但使用setTimeout避免调用栈溢出
          typingTimerRef.current = setTimeout(typeText, speed);
        } else {
          // 打字完成
          clearTypingTimer();
          onComplete();
          // 手动调用下一条
          state.current.isTextTyping = false;
          state.current.typingCurIndex = 0;
          if (state.current.processNextMessage) {
            state.current?.processNextMessage();
          }
        }
      };

      state.current.typeText = typeText;

      // 开始打字
      typeText();
    },
    [],
  );

  // 处理plan消息的打字机效果
  const processPlanTypingEffect = useCallback(
    (
      message: TypeMessage,
      options: TypeTypingOptions = { speed: 50, step: 5 },
      onProgress: (chunk: TypeMessage) => void,
      onComplete: () => void,
    ) => {
      // 内容为数组，需要把里面的title， description依次加到新数组里，onProgress输出新数组
      const { content = [] } = message;
      const { speed = 50, step = 5 } = options;

      // title description
      const newContent: any[] = [];
      // 当前处理的字符索引
      state.current = {
        ...state.current,
        currenttitleIndex: 0,
        currentDescriptionIndex: 0,
        currentItemIndex: 0,
      };

      state.current.isPlanTyping = true;

      const typePlan = () => {
        const {
          currenttitleIndex,
          currentDescriptionIndex,
          currentItemIndex,
          isPaused,
        } = state.current;
        if (isPaused) {
          return;
        }

        if (state.current.disableTyping) {
          // 直接返回所有剩余的内容，进入下一条
          const typingChunk = {
            ...message,
            content,
          };
          onProgress(typingChunk);
          clearTypingTimer();
          state.current = {
            ...state.current,
            currenttitleIndex: 0,
            currentDescriptionIndex: 0,
            currentItemIndex: 0,
          };
          state.current.isPlanTyping = false;
          onComplete();
          if (state.current.processNextMessage) {
            state.current?.processNextMessage();
          }
          return;
        }

        if (currentItemIndex < content.length) {
          // 确保当前 item 已初始化
          if (!newContent[currentItemIndex]) {
            newContent[currentItemIndex] = { title: "", description: "" };
          }

          // 先输出title
          const { title, description } = content[currentItemIndex];
          if (currenttitleIndex < title.length) {
            const titleToAdd = title.slice(
              currenttitleIndex,
              currenttitleIndex + step,
            );
            newContent[currentItemIndex].title += titleToAdd;
            onProgress({ ...message, content: newContent });
            state.current.currenttitleIndex += step;
          } else if (currentDescriptionIndex < description.length) {
            const descriptionToAdd = description.slice(
              currentDescriptionIndex,
              currentDescriptionIndex + step,
            );
            newContent[currentItemIndex].description += descriptionToAdd;
            onProgress({ ...message, content: newContent });
            state.current.currentDescriptionIndex += step;
          } else {
            // 去下一个item中处理title和description, 并把字符索引归零
            state.current.currentItemIndex++;
            state.current.currenttitleIndex = 0;
            state.current.currentDescriptionIndex = 0;
          }
          typingTimerRef.current = setTimeout(typePlan, speed);
        } else {
          clearTypingTimer();
          state.current = {
            ...state.current,
            currenttitleIndex: 0,
            currentDescriptionIndex: 0,
            currentItemIndex: 0,
          };
          state.current.isPlanTyping = false;
          onComplete();
          if (state.current.processNextMessage) {
            state.current?.processNextMessage();
          }
        }
      };

      state.current.typePlan = typePlan;

      typePlan();
    },
    [],
  );

  const processQueue = useCallback(
    ({
      messageQueue,
      handlerMaps,
      onComplete,
    }: {
      messageQueue: TypeMessage[];
      handlerMaps: TypeHandlerMap[];
      onComplete?: (data: any) => void;
    }) => {
      setProcessStatus(ProcessStatus.PROCESSING);
      // 如果队列为空，直接完成
      if (!messageQueue || messageQueue.length === 0) {
        setProcessStatus(ProcessStatus.COMPLETED);
        onComplete?.(state.current);
        return;
      }

      // 创建处理器映射表，便于快速查找
      const handlerMap = new Map<string, (message: TypeMessage) => void>();
      handlerMaps.forEach(({ type, handler }) => {
        handlerMap.set(type, handler);
      });

      resetState();

      // 初始化状态
      state.current = {
        ...state.current,
        isProcessing: true,
        isPaused: false,
        currentIndex: 0,
        messageQueue,
        handlerMap,
        handlerMaps,
        onComplete,
        processNextMessage: undefined, // 稍后定义
      };

      const processNextMessage = () => {
        const { currentIndex, messageQueue, isPaused, onComplete } =
          state.current;
        const queueLength = messageQueue.length;

        if (isPaused) {
          console.log("队列已暂停");
          return;
        }
        // 检查是否所有消息都处理完成
        if (currentIndex >= queueLength) {
          state.current.isProcessing = false;
          setProcessStatus(ProcessStatus.COMPLETED);
          onComplete?.(state.current);
          return;
        }

        const currentMessage = messageQueue[currentIndex];
        const {
          type: _type,
          content = "",
          messageType,
          taskId,
        } = currentMessage;

        const type = _type ? _type : messageType;
        // 调用进度回调
        // onProgress?.(currentIndex, queueLength, currentMessage);

        // 找到对应的处理器
        const handler = handlerMap.get(type);

        if (!handler) {
          console.warn(
            `未找到类型 "${type}" 的处理器，跳过该消息`,
            currentMessage,
          );
          state.current.currentIndex++;
          processNextMessage();
          return;
        }

        // 直接处理消息, 打字机效果是否使用由handler决定
        state.current.currentIndex++;
        try {
          handler(currentMessage);
          // handler里面调用了打字机函数，进入打字机状态，不进入下一条消息
          if (!state.current.isTextTyping && !state.current.isPlanTyping) {
            processNextMessage();
          }
        } catch (error) {
          console.error(`处理消息时出错:`, error, currentMessage);

          processNextMessage();
        }
      };

      state.current.processNextMessage = processNextMessage;

      // 开始处理第一条消息
      processNextMessage();
    },
    [],
  );

  // 暂停队列处理
  const pauseQueue = useCallback(() => {
    const _state = state.current;
    if (_state.isProcessing && !_state.isPaused) {
      _state.isPaused = true;
      console.log("队列处理已暂停");
      setProcessStatus(ProcessStatus.PAUSED);
    }
  }, []);

  // 继续队列处理
  const resumeQueue = useCallback(() => {
    const {
      isProcessing,
      isPaused,
      isTextTyping,
      typeText,
      isPlanTyping,
      typePlan,
      processNextMessage,
    } = state.current;
    if (isProcessing && isPaused) {
      state.current.isPaused = false;
      setProcessStatus(ProcessStatus.PROCESSING);
      // 如果当前正在打字，恢复打字机效果
      if (isTextTyping && typeText) {
        typeText();
      }
      if (isPlanTyping && typePlan) {
        typePlan();
      }

      // 继续处理下一条消息
      if (!isTextTyping && !isPlanTyping && processNextMessage) {
        processNextMessage();
      }
    }
  }, []);

  // 跳转到结果（禁用打字机）
  const jumpToResult = useCallback(() => {
    const { isProcessing, isPaused } = state.current;
    state.current.disableTyping = true;
    if (isProcessing && isPaused) {
      resumeQueue();
    }
  }, [resumeQueue]);

  // 重播队列
  const replayQueue = useCallback(
    (options) => {
      const { messageQueue, handlerMaps, onComplete } = state.current;
      if (processStatus === ProcessStatus.COMPLETED) {
        processQueue({
          messageQueue,
          handlerMaps,
          onComplete,
          ...options,
        });
      }
    },
    [processStatus],
  );

  // 强制结束队列处理
  const forceComplete = useCallback(() => {
    state.current.isProcessing = false;
    state.current.isPaused = false;
    setProcessStatus(ProcessStatus.COMPLETED);
  }, []);

  return {
    processTypingEffect,
    processPlanTypingEffect,
    pauseQueue,
    resumeQueue,
    processQueue,
    jumpToResult,
    replayQueue,
    processStatus,
    forceComplete,
  };
}
