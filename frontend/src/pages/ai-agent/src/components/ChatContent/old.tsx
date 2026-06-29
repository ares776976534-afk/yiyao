import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
  useMemo,
  forwardRef,
} from "react";
import { Modal } from "antd";
import { useSpm } from "ice";
import { v4 as uuidv4 } from "uuid";
import Header from "./components/header";
import Content from "./components/content";
import useToast from "@/components/Toast";
import useShare from "@/components/Share";
import type {
  TypeInputChatRef,
  TypeUploadItem,
} from "@/components/InputChat/types";
import { Status } from "@/components/InputChat/types";
import InputChat from "@/components/InputChat";
import OfferModal from "@/components/OfferModal";
import {
  BubuleGroup,
  TypeChatProps,
  HistoryItem,
  ProcessStatus,
} from "./index.d";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
// import { mockSmallTalk } from "./mock";
import { autorun } from "mobx";
import { useStore } from "@/stores/context";
import { routeJump, replaceUrlSearchParams } from "@/utils/url";
import { materialBaseAPIUrl } from "@/utils/env";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { checkAuthAndLogin } from "@/utils/login";
import { hasLoadingBubble } from "./utils/bubbleHelpers";
import {
  queryChatDetail,
  queryHistoryList,
  updateTitle,
  removeHistory,
  stopChat,
  createShare,
  getShareRecord,
  createChatCache,
} from "@/services";
import useTypingEffect from "./hooks/useTypingEffect";
import useThinkingDisplay from "./hooks/useThinkingDisplay";
import { fallbackImages } from "@/components/ChatContent/assets";
import { $t } from "@/i18n";
import compareVersion from "@/utils/compareVersion";
import { canvasFeatures } from "@/configs/studioDefaults";
import aplus from "@/utils/log";

const controller = new AbortController();
const { signal } = controller;
// 创建一个过滤空值的合并函数
const mergeNonEmptyFields = (target: any, source: any) => {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    // 只有当值不为空、不为undefined、不为空字符串时才更新
    if (value !== null && value !== undefined && value !== "") {
      result[key] = value;
    }
  }

  return result;
};

enum SSE_STATUS {
  DEFAULT = "default",
  RUNNING = "running",
  ERROR = "error",
  CLOSE = "close",
}

// 任务执行状态（独立于 SSE 连接状态）
enum TASK_STATUS {
  IDLE = "idle", // 空闲，没有任务
  RUNNING = "running", // 任务正在执行
  WAITING = "waiting", // 任务等待中（stopForWaiting）
  WAITING_FOR_USER = "waitingForUser", // 等待用户输入（waitForUser）
  COMPLETED = "completed", // 任务已完成（allDone）
  STOPPED = "stopped", // 任务已停止（stopByUser 或手动停止）
}

export { ProcessStatus };

export default forwardRef(function ChatContent(props: TypeChatProps, ref) {
  const {
    processTypingEffect,
    processQueue,
    processPlanTypingEffect,
    pauseQueue,
    resumeQueue,
    jumpToResult,
    replayQueue,
    processStatus,
  } = useTypingEffect();

  const toast = useToast();
  const [spmA, spmB] = useSpm();

  const inputChatRef = useRef<TypeInputChatRef>(null);
  const {
    logMaps,
    step,
    speed,
    typing = true,
    historyTyping = false,
    streamTyping = true,
    planStreamTyping = true,
    isShared = false,
    shareCode: propsShareCode = "",
    className = "",
    isMobile = false,
    contentContainerClassName = "",
    headerRender,
    onSessionChange,
    onCollapseChange,
    onShareStatusChange,
    onShareMessage,
  } = props;

  const { createShareModal } = useShare({
    logShareKey: logMaps?.share,
    logCopyUrlKey: logMaps?.copyurl,
  });

  // 根据 isMobile 选择样式
  const styles = isMobile ? mobileStyles : pcStyles;

  const store = useStore();
  const [modal, contextHolder] = Modal.useModal();
  const [bubules, setBubules] = useState<BubuleGroup>([]);
  const streamingBubbleRef = useRef<any[]>([
    // {
    //   role: "user",
    //   card_detail: {
    //     content: '你好',
    //     is_uncompleted: false,
    //   },
    // }
  ]);
  // 维护 cardId -> bubbleIndex 的映射关系
  const cardIdMapRef = useRef<Map<string, number>>(new Map());
  const isStatusStart = useRef<boolean>(false);

  // 存储当前的 plan 信息
  const currentPlanRef = useRef<{
    stepNum: number;
    steps: any[];
    planId: string;
  } | null>(null);
  // 存储每个步骤卡片的气泡索引（key: planId_stepId -> bubbleIndex）
  const stepCardBubbleIndexRef = useRef<Map<string, number>>(new Map());
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [inputChatData, setInputChataData] = useState<TypeUploadItem[]>([]);
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false); // 商品链接分析弹窗是否打开

  // stream数据队列
  const streamQueue = useRef<any[]>([]);
  // 是否在处理队列
  const isProcessingQueue = useRef<boolean>(false);

  const contentRef = useRef<any>(null);

  const metaRef = useRef<string>("");

  // 是否允许创建新会话
  const [createDisabled, setCreateDisabled] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("sessionId") || "";
  });
  const [projectName, setProjectName] = useState<string>("");

  // 等待继续请求的定时器
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 保存最新的 eventId、taskId 和 sessionId，用于继续请求
  const latestIdsRef = useRef<{
    eventId: string;
    taskId: string;
    sessionId: string;
  }>({
    eventId: "",
    taskId: "",
    sessionId: "",
  });
  // 标记是否正在等待重连（区分"等待中的关闭"和"真正结束的关闭"）
  const isWaitingForResumeRef = useRef<boolean>(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // 记录sse链接是否成功，链接未成功需发起重试
  const isSseSuccess = useRef<boolean>(false);
  // 记录重试次数，超出不再重试
  const retryTime = useRef<number>(0);

  // 正在中断任务
  const [isStopping, setIsStopping] = useState<boolean>(false);

  // sse请求状态
  const sseStatus = useRef<SSE_STATUS>(SSE_STATUS.DEFAULT);

  // 任务执行状态（独立于 SSE 连接状态）
  const taskStatus = useRef<TASK_STATUS>(TASK_STATUS.IDLE);

  /**
   * 核心逻辑：
   * 1. 0 token：用户发消息后立即显示思考中
   * 2. 有 token：收到内容消息后隐藏思考中，启动空档定时器
   * 3. 空档阈值：超过 IDLE_THRESHOLD 没收到新消息，再次显示思考中
   * 4. 最小显示时长：通过 useThinkingDisplay 保证不闪烁
   */
  const [shouldShowThinking, setShouldShowThinking] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 显示 heartbeat 的条件：
   * 1. status === RUNNING（正在请求中）
   * 2. !isStopping（没有正在停止）
   * 3. shouldShowThinking === true（需要显示思考中）
   * 4. !hasLoadingBubble（没有正在 loading 的气泡）
   */
  const hasLoading = hasLoadingBubble(bubules);
  const shouldShowHeartbeat = useMemo(() => {
    if (status !== Status.RUNNING || isStopping || hasLoading) {
      return false;
    }

    return shouldShowThinking;
  }, [status, isStopping, shouldShowThinking, hasLoading]);

  // 带最小显示时长保护的思考中状态
  const heartbeatVisible = useThinkingDisplay(shouldShowHeartbeat);

  /**
   * 结束生成：隐藏思考中，清除定时器
   */
  const endGeneration = () => {
    setShouldShowThinking(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  /**
   * 收到内容消息时调用：隐藏思考中，启动空档定时器
   */
  const onContentReceived = () => {
    endGeneration();

    // 启动新的空档定时器
    idleTimerRef.current = setTimeout(() => {
      setShouldShowThinking(true);
      idleTimerRef.current = null;
      setTimeout(() => {
        contentRef.current?.scrollToBottom();
      }, 50);
    }, 2500);
  };

  /**
   * 清空所有输入框相关的 URL 参数
   */
  const clearInputUrlParams = () => {
    replaceUrlSearchParams({
      cacheId: "",
      share: "",
      keyword: "",
      images: "",
      offerIds: "",
      autoSend: "",
    });
  };

  useEffect(() => {
    if (status === Status.PAUSED) {
      // 监听到暂停状态，停止sse连接，同时把status设置为loading状态
      stopSSE(sessionId);
    }
  }, [status]);

  useEffect(() => {
    if (isShared) {
      onShareStatusChange?.(processStatus);
    }
  }, [processStatus, isShared]);

  useEffect(() => {
    if (sessionId) {
      store.setSessionId(sessionId);
      onSessionChange?.(sessionId);
      clearInputUrlParams();
    }
  }, [sessionId]);

  // 组件卸载时清理等待定时器
  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
        isWaitingForResumeRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (isShared) {
      const query = new URLSearchParams(window.location.search);
      const shareCode = query.get("shareCode") || propsShareCode || "";
      getShareData(shareCode);
    }
  }, [isShared, propsShareCode]);

  useEffect(() => {
    if (inputChatRef.current) {
      store.setInputChat(inputChatRef.current);
    }
  }, [inputChatRef.current]);

  useImperativeHandle(
    ref,
    () => ({
      pause: pauseQueue,
      play: () => {
        resumeQueue();
      },
      rePlay: () => {
        // 先清空当前气泡列表
        setBubules([]);
        streamingBubbleRef.current = [];
        cardIdMapRef.current.clear(); // 清空 cardId 映射
        stepCardBubbleIndexRef.current.clear(); // 清空步骤卡片索引映射
        replayQueue({
          handlerMaps: getHandlerMap({
            typing,
            speed,
            step,
            addToCanvas: false,
            planStreamTyping,
          }),
        });
      },
      jumpToResult: () => {
        jumpToResult();
        contentRef.current?.scrollToBottom();
      },
      doTheSame: (jumpPageParams) => {
        // 取聊天记录中第一条user消息
        const userInfo = streamingBubbleRef.current.find(
          (v) => v.role === "user",
        );
        // 转成chatInput需要的格式
        const {
          content,
          media_items = [],
          offerInfos = [],
        } = userInfo.card_detail || {};

        createChatCache({
          query: content,
          attachments: {
            offer: offerInfos,
            image: media_items
              .filter((item) => item.media_type !== "link")
              .map((item) => ({
                url: item.media_cover_url,
                width: item.width || 0,
                height: item.height || 0,
              })),
          },
        })
          .then((res) => {
            routeJump("studio", {
              cacheId: res,
              spm: `${spmA}.${spmB}.do-the-same`,
              ...(jumpPageParams || {}),
            });
          })
          .catch((err) => {});
      },
    }),
    [pauseQueue, resumeQueue, jumpToResult, contentRef.current],
  );

  // 获取分享数据
  const getShareData = async (shareCode: string) => {
    try {
      const res = await getShareRecord({ shareCode });
      if (res) {
        const { title, messages, isOfficial = false } = res || {};
        setProjectName(title);

        onShareMessage?.(res);

        // 代表官方案例，开放做同款功能
        if (isOfficial) {
          window.dispatchEvent(
            new CustomEvent("officialShare", {
              detail: {
                isOfficial,
              },
            }),
          );
        }
        if (messages.length > 0) {
          // 在分享页模式下，优化消息处理顺序
          // 只区分前置/后置全局消息，保持步骤内部的原始顺序
          let processedQueue = messages;
          if (isShared) {
            // 找到第一个和最后一个有 stepId 的消息索引
            let firstStepIndex = -1;
            let lastStepIndex = -1;
            messages.forEach((msg: any, index: number) => {
              if (msg.stepId) {
                if (firstStepIndex === -1) firstStepIndex = index;
                lastStepIndex = index;
              }
            });

            // 按原始顺序重新组合：前置消息 -> 步骤消息（保持原顺序）-> 后置消息
            const prefixMessages: any[] = []; // 前置全局消息（步骤之前）
            const stepMessages: any[] = []; // 步骤相关消息（保持原顺序）
            const suffixMessages: any[] = []; // 后置全局消息（步骤之后）

            messages.forEach((msg: any, index: number) => {
              const hasStepId = !!msg.stepId;

              if (!hasStepId) {
                // 没有 stepId 的消息：根据位置判断是前置还是后置
                if (firstStepIndex === -1 || index < firstStepIndex) {
                  prefixMessages.push(msg);
                } else if (index > lastStepIndex) {
                  suffixMessages.push(msg);
                } else {
                  // 在步骤之间的全局消息，保持在步骤消息中
                  stepMessages.push(msg);
                }
              } else {
                stepMessages.push(msg);
              }
            });

            // 重新组合：前置消息 -> 步骤消息（保持原顺序）-> 后置消息
            processedQueue = [
              ...prefixMessages,
              ...stepMessages,
              ...suffixMessages,
            ];
            console.log(
              "【分享数据队列优化】原始:",
              messages.length,
              "前置:",
              prefixMessages.length,
              "步骤:",
              stepMessages.length,
              "后置:",
              suffixMessages.length,
            );
          }

          processQueue({
            messageQueue: processedQueue,
            handlerMaps: getHandlerMap({
              typing,
              speed,
              step,
              streamTyping,
            }),
            onComplete: () => {
              // 历史记录回放结束
              // console.log("历史记录回放结束");
            },
          });
        }
      }
    } catch (e) {}
  };

  const getDetail = async (sessionId) => {
    try {
      // const res = mockSmallTalk;
      const res = await queryChatDetail(sessionId);
      const { success, data = {} } = res || {};

      if (success) {
        const {
          title,
          messages: _message,
          latestEventId,
          latestTaskId,
          taskStatus,
        } = data;
        setProjectName(title);
        metaRef.current = data?.meta?.version;

        if (!_message) {
          return;
        }

        // 清空之前的状态
        // streamingBubbleRef.current = [];
        // cardIdMapRef.current.clear();
        // stepCardBubbleIndexRef.current.clear();
        // currentPlanRef.current = null;

        // 在分享页/历史回放模式下，优化消息处理顺序（与实时流式处理逻辑一致）
        // 只区分前置/后置全局消息，保持步骤内部的原始顺序
        let processedQueue = _message;

        if (isShared) {
          // 找到第一个和最后一个有 stepId 的消息索引
          let firstStepIndex = -1;
          let lastStepIndex = -1;
          _message.forEach((msg: any, index: number) => {
            if (msg.stepId) {
              if (firstStepIndex === -1) firstStepIndex = index;
              lastStepIndex = index;
            }
          });

          // 按原始顺序重新组合：前置消息 -> 步骤消息（保持原顺序）-> 后置消息
          const prefixMessages: any[] = [];
          const stepMessages: any[] = [];
          const suffixMessages: any[] = [];

          _message.forEach((msg: any, index: number) => {
            const hasStepId = !!msg.stepId;

            if (!hasStepId) {
              if (firstStepIndex === -1 || index < firstStepIndex) {
                prefixMessages.push(msg);
              } else if (index > lastStepIndex) {
                suffixMessages.push(msg);
              } else {
                stepMessages.push(msg);
              }
            } else {
              stepMessages.push(msg);
            }
          });

          processedQueue = [
            ...prefixMessages,
            ...stepMessages,
            ...suffixMessages,
          ];
          console.log(
            "【历史数据队列优化】原始:",
            _message.length,
            "前置:",
            prefixMessages.length,
            "步骤:",
            stepMessages.length,
            "后置:",
            suffixMessages.length,
          );
        }

        const needAddToCanvas = compareVersion(
          metaRef?.current,
          ">=",
          canvasFeatures.canvasMemory.version,
        );

        processQueue({
          messageQueue: processedQueue,
          handlerMaps: getHandlerMap({
            typing: historyTyping,
            speed,
            step,
            addToCanvas: needAddToCanvas,
            addUserToCanvas: false, // detail 接口回放时，用户消息不插入画布
          }),
          onComplete: () => {
            // 历史记录回放结束
            // console.log("历史记录回放结束");
          },
        });
        // startStepStream({ typing: false, addToCanvas: false });
        return {
          latestEventId,
          latestTaskId,
          taskStatus,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const getHistoryList = async () => {
    try {
      const res = await queryHistoryList({});
      if (res.length > 0) {
        setHistoryList(res);
        return res;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const fetchStream = useCallback(
    async (payload: any) => {
      const {
        content,
        files,
        latestEventId,
        latestTaskId,
        latestSessionId,
        // resume 模式专用参数
        mode = "chat",
        userInput,
      } = payload;

      // 等待后重新请求，使用传入的 sessionId，不然第一次进页面时不会传入 sessionId
      const sessionIdParam = latestSessionId || sessionId;
      const userPreferStore = store.userPrefer;

      const pattern = userPreferStore.agent;
      const { image = [], offer = [] } = files || {};

      // 参数校验
      // chat 模式：如果 attachments、offerInfos、query、lastEventId 都为空，则不发送请求
      // resume 模式：必须有 userInput
      if (mode === "chat") {
        if (
          image.length === 0 &&
          offer.length === 0 &&
          !content &&
          !latestEventId
        ) {
          console.log("【fetchStream】参数校验失败，所有参数都为空，取消请求");
          return;
        }
      }

      // 如果不是等待重连，清除等待标志（避免手动停止后又发起请求）
      if (!latestEventId) {
        isWaitingForResumeRef.current = false;

        // 清除可能存在的旧定时器（开始新任务时）
        if (waitingTimerRef.current) {
          console.log(
            "【fetchStream】开始新任务，清除旧定时器, timerId:",
            waitingTimerRef.current,
          );
          clearTimeout(waitingTimerRef.current);
          waitingTimerRef.current = null;
        }

        // 开始新任务
        taskStatus.current = TASK_STATUS.RUNNING;
        console.log("【fetchStream】开始新任务, taskStatus = RUNNING");
      } else if (
        latestEventId &&
        (taskStatus.current === TASK_STATUS.COMPLETED ||
          taskStatus.current === TASK_STATUS.STOPPED)
      ) {
        // 如果任务已完成或已停止，不应该建立新连接
        taskStatus.current = TASK_STATUS.COMPLETED;
        isSseSuccess.current = true;
        setStatus(Status.DEFAULT);
        return;
      }

      endGeneration();
      isSseSuccess.current = false;
      setStatus(Status.RUNNING);
      sseStatus.current = SSE_STATUS.RUNNING;

      metaRef.current = metaRef.current
        ? metaRef.current
        : canvasFeatures.currentVersion;

      // 根据 mode 和 userInput.type 决定接口 URL 和请求体
      const RESUME_API_BASE = `${materialBaseAPIUrl}/alpha-shop/agent`;
      let apiUrl = `${RESUME_API_BASE}/chat`;
      let resumeRequestBody: any = null;

      if (mode === "resume") {
        const resumeType = userInput?.type;

        switch (resumeType) {
          case "personalKbConfirm":
            // 个人知识库确认节点
            apiUrl = `${RESUME_API_BASE}/resume/v2`;
            resumeRequestBody = {
              sessionId: sessionIdParam,
              taskId: latestTaskId,
              resumePoint: userInput.resumePoint,
              feedback: {
                chooseStatus: userInput.chooseStatus,
                chooseIndex: userInput.chooseIndex,
              },
            };
            break;

          default:
            // 默认 resume 接口
            apiUrl = `${RESUME_API_BASE}/resume`;
            resumeRequestBody = {
              sessionId: sessionIdParam,
              taskId: latestTaskId,
              userInput: JSON.stringify(userInput),
            };
            break;
        }
      }

      const requestBody =
        mode === "resume"
          ? resumeRequestBody
          : {
              intent: window.aiIntent, // 临时调试切换意图模式
              pattern,
              query: content,
              lastEventId: latestEventId,
              taskId: latestTaskId,
              sessionId: sessionIdParam.startsWith("isNew_")
                ? ""
                : sessionIdParam,
              sessionMeta: {
                version: metaRef.current,
              },
              attachments: image.map((item: any) => {
                return {
                  id: item.id,
                  sourceUrl: item.url,
                  mimeType: "image/jpeg",
                  width: item.width,
                  height: item.height,
                };
              }),
              offerInfos: offer?.map((_offer: any) => {
                const newOffer = {
                  ..._offer,
                };

                // 删除服务端没有的属性，否则参数模型匹配不上
                delete newOffer.width;
                delete newOffer.height;
                delete newOffer._offerModuleSize;
                return newOffer;
              }),
            };

      await fetchEventSource(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal,
        openWhenHidden: true,
        async onopen(response) {
          if (response.status === 200) {
            retryTime.current = 0;
            setStatus(Status.RUNNING);
            sseStatus.current = SSE_STATUS.RUNNING;
            getHistoryList();
            contentRef.current?.scrollToBottom();
            isSseSuccess.current = true;
          } else if (response.status === 401) {
            checkAuthAndLogin({
              onSuccess: () => {
                fetchStream(payload);
              },
            }).then((loginSuccess) => {
              if (loginSuccess) {
                fetchStream(payload);
              }
            });
          } else {
            toast.error("连接失败");
          }
        },
        onerror(event) {
          // 抛出错误则停止重试，不返回任何内容，返回null,undefined，或者返回number，遇到错误会再次连接，number代表多长时间后重连
          // 已经连接成功，会话过程中断开，不做重连处理
          // 请求次数大于3次，不做重连处理
          if (isSseSuccess.current || retryTime.current > 3) {
            sseStatus.current = SSE_STATUS.ERROR;
            // 错误发生时，当前消息队列正在处理, 不做额外操作，已处理完成或当前队列无内容，手动把输入框状态重置
            if (!isProcessingQueue.current) {
              setStatus(Status.DEFAULT);
            }

            throw new Error("SSE error");
          } else {
            // 连接未成功，重试
            retryTime.current++;
            return null;
          }
        },
        onclose() {
          console.log("onclose - SSE 连接已关闭");
          console.log("onclose - 当前 taskStatus:", taskStatus.current);
          sseStatus.current = SSE_STATUS.CLOSE;

          // 清除等待定时器（SSE 连接已关闭，不应该再继续请求）
          // 但是：如果任务状态是 WAITING，说明是正常的等待场景，不应该清除定时器
          if (waitingTimerRef.current) {
            if (taskStatus.current === TASK_STATUS.WAITING) {
              console.log("onclose - 任务处于 WAITING 状态，保留等待定时器");
            } else {
              console.log("onclose - 任务不在 WAITING 状态，清除等待定时器");
              clearTimeout(waitingTimerRef.current);
              waitingTimerRef.current = null;
              isWaitingForResumeRef.current = false;
            }
          }
        },
        onmessage(event) {
          try {
            const message = JSON.parse(event.data);

            // 保存最新的 eventId、taskId 和 sessionId，用于继续请求
            if (message.id) {
              latestIdsRef.current.eventId = message.id;
            }
            if (message.taskId) {
              latestIdsRef.current.taskId = message.taskId;
            }
            if (message.sessionId) {
              latestIdsRef.current.sessionId = message.sessionId;
            }

            // 消息类型分类处理思考中状态
            if (message.type) {
              // 1. 需要立刻隐藏思考中的消息（进度类、流式内容）
              const immediateHideTypes = [
                "text_stream",
                "percent_loading",
                "multi_percent_loading",
                "offer_percent_loading",
                // "statusChange",
              ];
              // 2. 不触发任何思考中逻辑的消息（纯状态/元数据）
              const ignoreTypes = ["session", "resp"];

              if (immediateHideTypes.includes(message.type)) {
                // 立刻隐藏思考中，不启动空档定时器
                endGeneration();
              } else if (!ignoreTypes.includes(message.type)) {
                // 其他内容消息：隐藏思考中 + 启动空档定时器
                onContentReceived();
              }
            }

            // 把消息加入消息队列
            streamQueue.current.push(message);
            // 如果当前没有在处理队列，开始处理
            if (!isProcessingQueue.current) {
              // startStepStream({ typing: true, addToCanvas: true });
              isProcessingQueue.current = true;

              // 在分享页/历史回放模式下，优化消息处理顺序
              // 只区分前置/后置全局消息，保持步骤内部的原始顺序
              let processedQueue = streamQueue.current;
              if (isShared) {
                // 找到第一个和最后一个有 stepId 的消息索引
                let firstStepIndex = -1;
                let lastStepIndex = -1;
                streamQueue.current.forEach((msg, index) => {
                  if (msg.stepId) {
                    if (firstStepIndex === -1) firstStepIndex = index;
                    lastStepIndex = index;
                  }
                });

                // 按原始顺序重新组合
                const prefixMessages: any[] = [];
                const stepMessages: any[] = [];
                const suffixMessages: any[] = [];

                streamQueue.current.forEach((msg, index) => {
                  const hasStepId = !!msg.stepId;

                  if (!hasStepId) {
                    if (firstStepIndex === -1 || index < firstStepIndex) {
                      prefixMessages.push(msg);
                    } else if (index > lastStepIndex) {
                      suffixMessages.push(msg);
                    } else {
                      stepMessages.push(msg);
                    }
                  } else {
                    stepMessages.push(msg);
                  }
                });

                processedQueue = [
                  ...prefixMessages,
                  ...stepMessages,
                  ...suffixMessages,
                ];
                console.log(
                  "【流式队列优化】原始:",
                  streamQueue.current.length,
                  "前置:",
                  prefixMessages.length,
                  "步骤:",
                  stepMessages.length,
                  "后置:",
                  suffixMessages.length,
                );
              }

              processQueue({
                // 这里把每次的消息队列处理后清空，防止新的消息进入之后再次调用完整的消息队列出现重复从第一条开始
                messageQueue: processedQueue,
                handlerMaps: getHandlerMap({
                  typing,
                  speed,
                  step,
                }),
                onComplete: (data) => {
                  // 结束
                  const { currentIndex } = data;
                  streamQueue.current.splice(0, currentIndex);
                  isProcessingQueue.current = false;

                  // 队列处理完成之后，确认当前sse接口的状态，状态不是running，表示接口也请求结束，把输入框状态改为default
                  if (sseStatus.current !== SSE_STATUS.RUNNING) {
                    setStatus(Status.DEFAULT);
                  }
                },
              });
            }
          } catch (e) {}
        },
      });
    },
    [sessionId],
  );

  // 检查是否有多图正在加载中
  const hasMultiMediaLoading = () => {
    const now = Date.now();

    for (const bubble of streamingBubbleRef.current) {
      // 检查步骤卡片中的多图块
      if (
        bubble.card_detail?.type === "step_card" &&
        bubble.card_detail.contentBlocks
      ) {
        for (const block of bubble.card_detail.contentBlocks) {
          if (block.type === "multi_media" && block.content?.multiImages) {
            const { multiImages } = block.content;
            // 检查是否有图片正在加载（endTime 大于当前时间）
            for (const img of multiImages) {
              if (img.endTime && img.endTime > now) {
                return true;
              }
            }
          }
        }
      }

      // 检查独立的多图气泡
      if (
        bubble.card_detail?.type === "multi_media" &&
        bubble.card_detail.multiImages
      ) {
        const { multiImages } = bubble.card_detail;
        // 检查是否有图片正在加载（endTime 大于当前时间）
        for (const img of multiImages) {
          if (img.endTime && img.endTime > now) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const handleHeartbeat = () => {
    // 当前会话任务未结束
    if (sseStatus.current === SSE_STATUS.RUNNING && !isStatusStart.current) {
      // 临时加入思考中状态，后续statusChange中会被覆盖
      setBubules([
        ...streamingBubbleRef.current,
        {
          role: "heartbeat",
          card_detail: {
            is_uncompleted: false,
            type: "heartbeat",
          },
        },
      ]);
    }
  };

  const handleUserMessage = (data: any, addToCanvas: boolean = false) => {
    const { query, attachments = [], offerInfos = [] } = data;
    const media_items_from_attachments = attachments.map((item) => {
      return {
        media_url: item.sourceUrl,
        media_cover_url: item.sourceUrl,
        media_type: "image",
        width: item.width,
        height: item.height,
        id: item.id || uuidv4(),
      };
    });

    const media_items_from_offerInfos = offerInfos.map((item) => {
      return {
        media_url: item.images?.[0],
        media_cover_url: item.images?.[0],
        media_type: "link",
        offerId: item.offerId,
        id: item.id || uuidv4(),
      };
    });

    const media_items = [
      ...media_items_from_attachments,
      ...media_items_from_offerInfos,
    ];

    if (addToCanvas) {
      // 添加图片到画布
      store.addImgElement(media_items_from_attachments);
      // 添加商品卡到画布
      store.addOfferElement(offerInfos);
    }

    const bubble = {
      role: "user",
      card_detail: {
        media_items,
        content: query,
        offerInfos,
        is_uncompleted: false, // 用户输入内容节点直接进入完成状态
      },
    };

    streamingBubbleRef.current.push(bubble);

    setBubules([...streamingBubbleRef.current]);
  };

  // 处理意图节点
  const handleIntent = (data: any) => {
    const { intent } = data;
    const lastBubble = streamingBubbleRef.current.at(-1);

    if (lastBubble && lastBubble?.card_detail?.is_uncompleted !== false) {
      lastBubble.intent = intent;
    } else {
      // 检查是否是多步骤任务
      const currentPlan = currentPlanRef.current;
      const isMultiStep = currentPlan && currentPlan.stepNum > 1;

      // 多步骤任务不创建空气泡
      if (isMultiStep) {
        isStatusStart.current = true;
        return;
      }

      // 检查上一个气泡是否是空的 assistant 气泡（已完成但没有内容）
      // 如果是，复用它而不是创建新的，避免残留空气泡
      const isLastEmptyAssistant =
        lastBubble?.role === "assistant" &&
        lastBubble?.card_detail?.is_uncompleted === false &&
        !lastBubble?.card_detail?.content &&
        !lastBubble?.card_detail?.type;

      if (isLastEmptyAssistant) {
        // 复用空气泡
        lastBubble.intent = intent;
        lastBubble.card_detail.is_uncompleted = true;
        isStatusStart.current = true;
      } else {
        const newStreamingBubble = {
          role: "assistant",
          intent,
          card_detail: {
            is_uncompleted: true,
            content: "",
          },
        };
        isStatusStart.current = true;
        streamingBubbleRef.current.push(newStreamingBubble);
      }
    }

    setBubules([...streamingBubbleRef.current]);
  };

  // 【兜底处理】遍历所有气泡，把还在 is_uncompleted 状态但没有图片数据的 design/multi_media 强制标记为失败
  // 辅助函数：标记 design 内容为失败
  const markDesignAsFailed = (designContent: any) => {
    if (
      designContent?.is_uncompleted === true &&
      (!designContent?.media_items || designContent.media_items.length === 0)
    ) {
      designContent.is_uncompleted = false;
      designContent.failed = true;
    }
  };
  // 辅助函数：标记 multi_media 中未完成的图片为失败
  const markMultiMediaAsFailed = (multiMediaContent: any) => {
    if (multiMediaContent?.multiImages) {
      multiMediaContent.multiImages.forEach((img: any) => {
        if (img.is_uncompleted && !img.media_item) {
          img.is_uncompleted = false;
          img.failed = true;
        }
      });
      multiMediaContent.is_uncompleted = false;
    }
  };

  // 处理状态变化
  const handleStatusChange = (data: any) => {
    // 最后一个消息节点
    const lastBubble = streamingBubbleRef.current.at(-1);
    const intent = lastBubble?.intent || "";
    const { is_uncompleted, content } = lastBubble?.card_detail || {};

    if (data.status === "start") {
      // 连续两个start不重复生成气泡
      if (is_uncompleted && !content) {
        return;
      }
      // 检查是否是多步骤任务
      const currentPlan = currentPlanRef.current;
      const isMultiStep = currentPlan && currentPlan.stepNum > 1;

      // 多步骤任务不创建空气泡，因为会在收到文案时创建步骤卡片
      if (isMultiStep) {
        isStatusStart.current = true;
        return;
      }

      // 连续的start/end 不重复生成气泡
      const isEmptyAssistantBubble =
        lastBubble?.role === "assistant" &&
        is_uncompleted === true &&
        !content &&
        !lastBubble?.card_detail?.type;

      if (isEmptyAssistantBubble) {
        isStatusStart.current = true;
        return;
      }

      const newStreamingBubble = {
        role: "assistant",
        intent,
        card_detail: {
          is_uncompleted: true,
          content: "",
        },
      };
      isStatusStart.current = true;
      streamingBubbleRef.current.push(newStreamingBubble);
      // 开始新的消息块
    } else if (data.status === "end") {
      // 结束当前消息块
      isStatusStart.current = false;

      // 检查是否是多步骤任务
      const currentPlan = currentPlanRef.current;
      const isMultiStep = currentPlan && currentPlan.stepNum > 1;

      // 多步骤任务不需要手动标记 end，因为步骤卡片会在 plan_status 中标记完成
      if (isMultiStep) {
        return;
      }

      // 单步骤任务，标记最后一个气泡完成
      const singleStepLastBubble = streamingBubbleRef.current.at(-1);
      if (singleStepLastBubble) {
        const cardDetail = singleStepLastBubble.card_detail;
        // 如果气泡是空的（无内容、无类型），不标记完成，保留给下一个 start 复用
        // 避免连续 start/end 导致重复创建空气泡
        if (
          singleStepLastBubble.role === "assistant" &&
          cardDetail?.is_uncompleted === true &&
          !cardDetail?.content &&
          !cardDetail?.type
        ) {
          // 空气泡不标记完成，直接返回
          return;
        }
        // 有内容的气泡，标记为完成
        singleStepLastBubble.card_detail = {
          ...cardDetail,
          is_uncompleted: false,
        };
      }
    } else if (data.status === "allDone") {
      // 当前sse返回结束
      console.log("【allDone】收到任务完成信号, 设置 taskStatus = COMPLETED");
      setIsStopping(false);
      sseStatus.current = SSE_STATUS.CLOSE;

      // 设置任务状态为已完成
      taskStatus.current = TASK_STATUS.COMPLETED;

      // 清除等待定时器（任务已完成，不需要再继续请求）
      if (waitingTimerRef.current) {
        console.log(
          "【allDone】清除等待定时器, timerId:",
          waitingTimerRef.current,
        );
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
        isWaitingForResumeRef.current = false;
      } else {
        console.log("【allDone】没有活跃的等待定时器");
        // 即使没有定时器，也要清除标志，防止意外情况
        isWaitingForResumeRef.current = false;
      }

      streamingBubbleRef.current.forEach((bubble) => {
        const cardDetail = bubble?.card_detail || {};
        if (!cardDetail) return;
        if (cardDetail.type === "design") {
          markDesignAsFailed(cardDetail);
        }
        if (cardDetail.type === "multi_media") {
          markMultiMediaAsFailed(cardDetail);
        }
        if (cardDetail.type === "step_card" && cardDetail.contentBlocks) {
          cardDetail.contentBlocks.forEach((block: any) => {
            if (block.type === "design") {
              markDesignAsFailed(block.content);
            }
            if (block.type === "multi_media") {
              markMultiMediaAsFailed(block.content);
            }
          });
          // 检查步骤内所有内容块是否都完成
          const allBlocksCompleted = cardDetail.contentBlocks.every(
            (block: any) => !block.content?.is_uncompleted,
          );
          if (allBlocksCompleted) {
            cardDetail.is_uncompleted = false;
          }
        }
      });

      // 闲聊模式不输出任务已结束
      if (intent !== "smallTalk") {
        streamingBubbleRef.current.push({
          role: "taskEndStatus",
          intent,
          card_detail: {
            is_uncompleted: false,
            type: "done",
            content: $t(
              "global-1688-ai-app.ChatContent.taskyEnd",
              "任务已结束",
            ),
          },
        });
      }
    } else if (data.status === "stopByUser") {
      console.log("【stopByUser】收到任务终止信号, 设置 taskStatus = STOPPED");
      setIsStopping(false);
      sseStatus.current = SSE_STATUS.CLOSE;

      // 设置任务状态为已停止
      taskStatus.current = TASK_STATUS.STOPPED;

      // 清除等待定时器（任务被终止，不需要再继续请求）
      if (waitingTimerRef.current) {
        console.log(
          "【stopByUser】清除等待定时器, timerId:",
          waitingTimerRef.current,
        );
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
        isWaitingForResumeRef.current = false;
      } else {
        console.log("【stopByUser】没有活跃的等待定时器");
        // 即使没有定时器，也要清除标志，防止意外情况
        isWaitingForResumeRef.current = false;
      }

      streamingBubbleRef.current.push({
        role: "taskEndStatus",
        intent,
        card_detail: {
          is_uncompleted: false,
          type: "stopped",
          content: $t("global-1688-ai-app.ChatContent.taskyzz", "任务已终止"),
        },
      });
    } else if (data.status === "stopForWaiting") {
      // 等待继续请求
      const { context } = data;
      const waitingUtil = context?.waitingUtil;

      if (waitingUtil) {
        const now = Date.now();
        const waitTime = Math.max(0, waitingUtil - now);

        console.log("【stopForWaiting】收到等待指令");
        console.log(
          "  - waitingUtil:",
          waitingUtil,
          "需要等待:",
          Math.ceil(waitTime / 1000),
          "秒",
        );
        console.log("  - 当前 taskStatus:", taskStatus.current);
        console.log("  - 当前 sseStatus:", sseStatus.current);

        // 检查任务状态：如果任务已完成或已停止，不应该设置等待定时器
        if (
          taskStatus.current === TASK_STATUS.COMPLETED ||
          taskStatus.current === TASK_STATUS.STOPPED
        ) {
          console.log(
            "【stopForWaiting】任务已结束 (taskStatus =",
            `${taskStatus.current})，忽略等待指令`,
          );
          return;
        }

        // 显示等待提示
        // streamingBubbleRef.current.push({
        //   role: "taskEndStatus",
        //   intent,
        //   card_detail: {
        //     is_uncompleted: true,
        //     type: "waiting",
        //     content: $t(
        //       "global-1688-ai-app.ChatContent.waiting",
        //       `任务排队中，预计等待 ${Math.ceil(waitTime / 1000)} 秒后继续...`,
        //       [Math.ceil(waitTime / 1000)],
        //     ),
        //     waitingUtil,
        //   },
        // });

        // 清除之前的定时器（防止多个定时器同时存在）
        if (waitingTimerRef.current) {
          console.log("【stopForWaiting】清除之前的定时器");
          clearTimeout(waitingTimerRef.current);
          waitingTimerRef.current = null;
        }

        // 设置任务状态为等待中
        taskStatus.current = TASK_STATUS.WAITING;

        // 标记正在等待重连
        isWaitingForResumeRef.current = true;

        // 保存当前的 sessionId 和 taskId，确保在等待期间切换会话或任务时使用正确的 ID
        const savedSessionId = latestIdsRef.current.sessionId || sessionId;
        const savedTaskId = latestIdsRef.current.taskId;

        // 设置定时器，到达时间后继续请求
        const timerId = setTimeout(async () => {
          // 检查 taskId 是否匹配（防止不同任务的定时器互相干扰）
          if (latestIdsRef.current.taskId !== savedTaskId) {
            console.log(
              "【定时器取消】taskId 不匹配 (当前:",
              latestIdsRef.current.taskId,
              "保存的:",
              `${savedTaskId})，取消继续请求`,
            );
            waitingTimerRef.current = null;
            isWaitingForResumeRef.current = false;
            return;
          }

          // 检查任务状态：只有在 WAITING 状态才继续请求
          if (taskStatus.current !== TASK_STATUS.WAITING) {
            console.log(
              "【定时器取消】任务状态不是 WAITING (当前:",
              `${taskStatus.current})，取消继续请求`,
            );
            waitingTimerRef.current = null;
            isWaitingForResumeRef.current = false;
            return;
          }

          // 双重检查：确认标志位
          if (!isWaitingForResumeRef.current) {
            console.log("【定时器取消】等待标志已清除，取消继续请求");
            waitingTimerRef.current = null;
            return;
          }

          // 移除等待提示，改为继续中
          // const waitingBubble = streamingBubbleRef.current.at(-1);
          // if (waitingBubble && waitingBubble.card_detail?.type === "waiting") {
          //   waitingBubble.card_detail.is_uncompleted = false;
          //   waitingBubble.card_detail.content = $t(
          //     "global-1688-ai-app.ChatContent.waitingDone",
          //     "排队结束，继续生成...",
          //   );
          // }
          // setBubules([...streamingBubbleRef.current]);

          // 继续请求前，再次检查标志（防止在等待期间任务被停止）
          if (!isWaitingForResumeRef.current) {
            console.log("【定时器取消】等待期间任务已结束，取消继续请求");
            waitingTimerRef.current = null;
            return;
          }

          console.log("【定时器执行】开始发起继续请求");

          // 分享页不调用 detail 接口，直接使用原有 eventId
          if (isShared) {
            console.log(
              "【分享页】跳过 detail 接口调用，直接使用原有 eventId 继续请求",
            );

            // 恢复任务状态为运行中
            // taskStatus.current = TASK_STATUS.RUNNING;

            // // 使用原有的 eventId 继续请求
            // fetchStream({
            //   content: "", // 继续请求不需要 content
            //   files: { image: [], offer: [] },
            //   latestEventId: latestIdsRef.current.eventId,
            //   latestTaskId: latestIdsRef.current.taskId,
            //   latestSessionId: savedSessionId,
            // });

            // 清除定时器引用和等待标志
            waitingTimerRef.current = null;
            isWaitingForResumeRef.current = false;
            return;
          }

          console.log("【非分享页】先调用 detail 接口获取最新 eventId");

          // 非分享页：先调用 detail 接口获取最新的 latestEventId
          try {
            const detailResult = await queryChatDetail(savedSessionId);

            if (detailResult.success && detailResult.data) {
              const {
                latestEventId: newEventId,
                latestTaskId: newTaskId,
                messages: _message,
                title,
              } = detailResult.data;

              // 检查当前任务的 messages 中是否已经有 allDone 状态
              // 【重要】只检查当前任务的 allDone，而不是所有任务的 allDone
              // 因为 detail 返回的 messages 可能包含多个任务的消息，前面的任务可能已经完成
              const currentTaskId = savedTaskId || newTaskId;
              const hasAllDone = _message?.some(
                (msg: any) =>
                  msg.type === "statusChange" &&
                  msg.status === "allDone" &&
                  msg.taskId === currentTaskId,
              );

              if (hasAllDone) {
                console.log(
                  "【detail 检测到任务已完成】检测到 allDone 状态，取消继续请求",
                );

                // 设置任务状态为已完成
                taskStatus.current = TASK_STATUS.COMPLETED;
                sseStatus.current = SSE_STATUS.CLOSE;
                setIsStopping(false);

                // 清除定时器引用和等待标志
                waitingTimerRef.current = null;
                isWaitingForResumeRef.current = false;

                // 更新标题
                if (title) {
                  setProjectName(title);
                }

                // 更新对话内容
                if (_message && _message.length > 0) {
                  console.log(
                    "【更新对话内容】使用 detail 返回的 messages 更新对话",
                  );

                  // 清空之前的状态，准备重新渲染
                  streamingBubbleRef.current = [];
                  cardIdMapRef.current.clear();
                  stepCardBubbleIndexRef.current.clear();
                  currentPlanRef.current = null;

                  // 【重要】过滤掉会影响任务状态的消息，避免状态冲突
                  const filteredMessages = _message.filter((msg: any) => {
                    if (msg.type === "statusChange") {
                      if (
                        ["stopForWaiting", "allDone", "stopByUser"].includes(
                          msg.status,
                        )
                      ) {
                        return false;
                      }
                    }
                    return true;
                  });

                  // 使用 processQueue 处理消息队列，重新渲染对话
                  // 只区分前置/后置全局消息，保持步骤内部的原始顺序
                  let processedQueue = filteredMessages;
                  if (isShared) {
                    let firstStepIndex = -1;
                    let lastStepIndex = -1;
                    filteredMessages.forEach((msg: any, index: number) => {
                      if (msg.stepId) {
                        if (firstStepIndex === -1) firstStepIndex = index;
                        lastStepIndex = index;
                      }
                    });

                    const prefixMessages: any[] = [];
                    const stepMessages: any[] = [];
                    const suffixMessages: any[] = [];

                    filteredMessages.forEach((msg: any, index: number) => {
                      const hasStepId = !!msg.stepId;
                      if (!hasStepId) {
                        if (firstStepIndex === -1 || index < firstStepIndex) {
                          prefixMessages.push(msg);
                        } else if (index > lastStepIndex) {
                          suffixMessages.push(msg);
                        } else {
                          stepMessages.push(msg);
                        }
                      } else {
                        stepMessages.push(msg);
                      }
                    });

                    processedQueue = [
                      ...prefixMessages,
                      ...stepMessages,
                      ...suffixMessages,
                    ];
                    console.log(
                      "【重连队列优化-allDone】原始:",
                      _message.length,
                      "过滤后:",
                      filteredMessages.length,
                      "前置:",
                      prefixMessages.length,
                      "步骤:",
                      stepMessages.length,
                      "后置:",
                      suffixMessages.length,
                    );
                  }

                  processQueue({
                    messageQueue: processedQueue,
                    handlerMaps: getHandlerMap({ typing: false, speed, step }),
                    onComplete: () => {
                      console.log(
                        "【对话内容更新完成】任务已完成，不需要继续请求",
                      );
                    },
                  });
                }

                return; // 直接返回，不再继续调用 chat 接口
              }

              // 再次检查任务状态和标志位
              if (
                taskStatus.current !== TASK_STATUS.WAITING ||
                !isWaitingForResumeRef.current
              ) {
                console.log(
                  "【定时器取消】detail 返回后任务状态已改变，取消继续请求",
                );
                waitingTimerRef.current = null;
                isWaitingForResumeRef.current = false;
                return;
              }

              // 更新标题
              if (title) {
                setProjectName(title);
              }

              // 更新对话内容（如果有 messages）
              if (_message && _message.length > 0) {
                console.log(
                  "【更新对话内容】使用 detail 返回的 messages 更新对话",
                );

                // 清空之前的状态，准备重新渲染
                streamingBubbleRef.current = [];
                cardIdMapRef.current.clear();
                stepCardBubbleIndexRef.current.clear();
                currentPlanRef.current = null;

                // 【重要】过滤掉会影响任务状态的消息，避免在重连场景下造成状态冲突
                // 1. stopForWaiting: 会设置新的定时器
                // 2. allDone: 会设置 taskStatus = COMPLETED，导致后续 fetchStream 被取消
                // 3. stopByUser: 会设置 taskStatus = STOPPED
                const filteredMessages = _message.filter((msg: any) => {
                  if (msg.type === "statusChange") {
                    // 过滤掉这些会影响任务状态的消息
                    if (
                      ["stopForWaiting", "allDone", "stopByUser"].includes(
                        msg.status,
                      )
                    ) {
                      return false;
                    }
                  }
                  return true;
                });

                // 使用 processQueue 处理消息队列，重新渲染对话
                // 只区分前置/后置全局消息，保持步骤内部的原始顺序
                let processedQueue = filteredMessages;
                if (isShared) {
                  let firstStepIndex = -1;
                  let lastStepIndex = -1;
                  filteredMessages.forEach((msg: any, index: number) => {
                    if (msg.stepId) {
                      if (firstStepIndex === -1) firstStepIndex = index;
                      lastStepIndex = index;
                    }
                  });

                  const prefixMessages: any[] = [];
                  const stepMessages: any[] = [];
                  const suffixMessages: any[] = [];

                  filteredMessages.forEach((msg: any, index: number) => {
                    const hasStepId = !!msg.stepId;
                    if (!hasStepId) {
                      if (firstStepIndex === -1 || index < firstStepIndex) {
                        prefixMessages.push(msg);
                      } else if (index > lastStepIndex) {
                        suffixMessages.push(msg);
                      } else {
                        stepMessages.push(msg);
                      }
                    } else {
                      stepMessages.push(msg);
                    }
                  });

                  processedQueue = [
                    ...prefixMessages,
                    ...stepMessages,
                    ...suffixMessages,
                  ];
                  console.log(
                    "【重连队列优化】原始:",
                    _message.length,
                    "过滤后:",
                    filteredMessages.length,
                    "前置:",
                    prefixMessages.length,
                    "步骤:",
                    stepMessages.length,
                    "后置:",
                    suffixMessages.length,
                  );
                }

                processQueue({
                  messageQueue: processedQueue,
                  handlerMaps: getHandlerMap({ typing: false, speed, step }),
                  onComplete: () => {
                    console.log("【对话内容更新完成】准备继续请求");
                  },
                });
              }

              // 恢复任务状态为运行中
              taskStatus.current = TASK_STATUS.RUNNING;

              // 使用从 detail 接口获取的最新 eventId 继续请求
              fetchStream({
                content: "", // 继续请求不需要 content
                files: { image: [], offer: [] },
                latestEventId: newEventId,
                latestTaskId: newTaskId || latestIdsRef.current.taskId,
                latestSessionId: savedSessionId,
              });

              // 清除定时器引用和等待标志（继续请求后，需要等待新的 stopForWaiting 才能再次设置）
              console.log("【定时器执行】清除定时器引用和等待标志");
              waitingTimerRef.current = null;
              isWaitingForResumeRef.current = false;
            } else {
              console.error(
                "【detail 接口失败】未获取到有效数据，使用原有 eventId 继续请求",
              );

              // 如果 detail 接口失败，降级使用原有的 eventId
              taskStatus.current = TASK_STATUS.RUNNING;

              fetchStream({
                content: "", // 继续请求不需要 content
                files: { image: [], offer: [] },
                latestEventId: latestIdsRef.current.eventId,
                latestTaskId: latestIdsRef.current.taskId,
                latestSessionId: savedSessionId,
              });

              waitingTimerRef.current = null;
              isWaitingForResumeRef.current = false;
            }
          } catch (error) {
            console.error("【detail 接口异常】", error);

            // 如果 detail 接口异常，降级使用原有的 eventId
            if (
              taskStatus.current === TASK_STATUS.WAITING &&
              isWaitingForResumeRef.current
            ) {
              taskStatus.current = TASK_STATUS.RUNNING;

              fetchStream({
                content: "", // 继续请求不需要 content
                files: { image: [], offer: [] },
                latestEventId: latestIdsRef.current.eventId,
                latestTaskId: latestIdsRef.current.taskId,
                latestSessionId: savedSessionId,
              });
            }

            waitingTimerRef.current = null;
            isWaitingForResumeRef.current = false;
          }
        }, waitTime);

        waitingTimerRef.current = timerId;
        console.log(
          "【stopForWaiting】已设置定时器, timerId:",
          timerId,
          "等待时间:",
          Math.ceil(waitTime / 1000),
          "秒",
        );
      }
    } else if (data.status === "waitForUser") {
      latestIdsRef.current.sessionId = data.sessionId;
      latestIdsRef.current.taskId = data.taskId;
      // 等待用户输入（如 imageChoose 卡片选择）
      console.log("【waitForUser】收到等待用户输入信号");

      // 标记 SSE 状态为关闭，防止 handleHeartbeat 继续添加思考中状态
      sseStatus.current = SSE_STATUS.CLOSE;

      // 设置任务状态为等待用户输入
      taskStatus.current = TASK_STATUS.WAITING_FOR_USER;

      // 把输入框状态改为默认
      setStatus(Status.DEFAULT);

      // 后端会关闭 SSE 连接，onclose 会自动触发
      // 不设置定时器，等待用户在卡片上操作后调用 resumeChat
    }
    setBubules([...streamingBubbleRef.current]);
  };

  // 辅助函数：按照 stepId 顺序插入步骤卡片
  const insertStepCardInOrder = (
    newStepCard: any,
    planId: string,
    stepId: string | number,
  ) => {
    const currentStepId = Number(stepId);
    let insertIndex = streamingBubbleRef.current.length;

    // 找到第一个 stepId 大于当前 stepId 的步骤卡片的位置
    for (let i = streamingBubbleRef.current.length - 1; i >= 0; i--) {
      const bubble = streamingBubbleRef.current[i];
      if (
        bubble.card_detail?.type === "step_card" &&
        bubble.card_detail?.planId === planId
      ) {
        const existingStepId = Number(bubble.card_detail.stepId);
        if (existingStepId > currentStepId) {
          insertIndex = i;
        } else {
          // 找到第一个小于等于当前 stepId 的，插入到它后面
          break;
        }
      }
    }

    // 在指定位置插入
    streamingBubbleRef.current.splice(insertIndex, 0, newStepCard);

    // 更新所有步骤卡片的索引（因为插入导致后面的索引都变了）
    stepCardBubbleIndexRef.current.clear();
    streamingBubbleRef.current.forEach((bubble, index) => {
      if (
        bubble.card_detail?.type === "step_card" &&
        bubble.card_detail?.planId &&
        bubble.card_detail?.stepId
      ) {
        const key = `${bubble.card_detail.planId}_${bubble.card_detail.stepId}`;
        stepCardBubbleIndexRef.current.set(key, index);
      }
    });

    // 更新 cardIdMapRef（因为索引变了）
    cardIdMapRef.current.clear();
    streamingBubbleRef.current.forEach((bubble, index) => {
      // 重新建立 cardId 映射
      if (bubble.card_detail?.type === "step_card") {
        // 步骤卡片中的多图（支持 contentBlocks）
        if (bubble.card_detail.contentBlocks) {
          bubble.card_detail.contentBlocks.forEach((block: any) => {
            if (block.type === "multi_media" && block.content?.cardId) {
              cardIdMapRef.current.set(block.content.cardId, index);
            }
          });
        } else if (bubble.card_detail.multiMediaContent?.cardId) {
          // 向后兼容旧结构
          cardIdMapRef.current.set(
            bubble.card_detail.multiMediaContent.cardId,
            index,
          );
        }
      } else if (
        bubble.card_detail?.type === "multi_media" &&
        bubble.card_detail?.cardId
      ) {
        cardIdMapRef.current.set(bubble.card_detail.cardId, index);
      }
    });

    // 返回新插入的步骤卡片索引（刚插入的一定存在）
    const newIndex = stepCardBubbleIndexRef.current.get(`${planId}_${stepId}`);
    if (newIndex === undefined) {
      console.error(
        "【insertStepCardInOrder】插入后未找到索引，planId:",
        planId,
        "stepId:",
        stepId,
      );
      return insertIndex; // 返回插入位置作为备选
    }
    return newIndex;
  };

  const handleTextAndAnalyzerChunk = (data: any) => {
    const { content, planId, stepId, isReplaceMode, ...others } = data;

    // 检查是否属于多步骤任务
    const currentPlan = currentPlanRef.current;
    const isMultiStep = currentPlan && currentPlan.stepNum > 1;

    // 如果是多步骤任务且有 stepId，更新或创建步骤卡片
    if (isMultiStep && stepId && planId) {
      const key = `${planId}_${stepId}`;
      let bubbleIndex = stepCardBubbleIndexRef.current.get(key);

      // 如果步骤卡片还不存在，创建新的
      if (bubbleIndex === undefined) {
        // 从 plan 信息中获取步骤标题
        const stepInfo = currentPlan.steps.find(
          (s) => Number(s.stepId) === Number(stepId),
        );
        const stepTitle =
          stepInfo?.displayTitle ||
          stepInfo?.stepTitle ||
          $t("global-1688-ai-app.ChatContent.bz", `步骤${stepId}`, [stepId]);

        const stepCardBubble = {
          role: "assistant",
          card_detail: {
            type: "step_card",
            stepId,
            stepTitle,
            planId,
            is_uncompleted: true,
            contentBlocks: [
              {
                type: "text",
                content: {
                  type: data.type || "text",
                  content: "",
                  ...others,
                },
              },
            ],
          },
          _bubbleId: `step_card_${planId}_${stepId}_${Date.now()}`,
        };

        // 按照 stepId 顺序插入
        bubbleIndex = insertStepCardInOrder(stepCardBubble, planId, stepId);
      }

      // 更新步骤卡片的文本内容
      if (bubbleIndex !== undefined) {
        const stepCardBubble = streamingBubbleRef.current[bubbleIndex];
        if (stepCardBubble && stepCardBubble.card_detail.contentBlocks) {
          // 检查最后一个块（不是查找最后一个 text 块）
          const lastBlock =
            stepCardBubble.card_detail.contentBlocks[
              stepCardBubble.card_detail.contentBlocks.length - 1
            ];

          // 只有当最后一个块是 text 类型时才追加/覆盖，否则创建新的
          if (lastBlock && lastBlock.type === "text") {
            // 如果是覆盖模式，直接替换内容；否则追加
            if (isReplaceMode) {
              lastBlock.content.content = content;
            } else {
              lastBlock.content.content += content;
            }
          } else {
            // 最后一个块不是 text（可能是 multi_media 或 design），创建新的 text 块
            stepCardBubble.card_detail.contentBlocks.push({
              type: "text",
              content: {
                type: data.type || "text",
                content,
                ...others,
              },
            });
          }
        }
      }

      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // 单步骤任务或没有 stepId 的内容，按原逻辑处理
    const curStreamingBubble = streamingBubbleRef.current.at(-1);

    // 判断是否需要创建新的文本气泡（而不是追加到上一个气泡）
    const shouldCreateNewBubble =
      curStreamingBubble &&
      // 1. 多步骤任务且最后一个是步骤卡片
      ((isMultiStep && curStreamingBubble.card_detail?.type === "step_card") ||
        // 2. 最后一个是多图气泡（避免文本被追加到图片气泡）
        curStreamingBubble.card_detail?.type === "multi_media" ||
        // 3. 最后一个气泡已经完成（避免追加到已完成的气泡）
        curStreamingBubble.card_detail?.is_uncompleted === false);

    if (shouldCreateNewBubble) {
      const newTextBubble = {
        role: "assistant",
        card_detail: {
          type: "text",
          content: content || "",
          ...others,
        },
      };

      streamingBubbleRef.current.push(newTextBubble);
      setBubules([...streamingBubbleRef.current]);
      return;
    }

    if (curStreamingBubble) {
      curStreamingBubble.card_detail = {
        ...curStreamingBubble.card_detail,
        ...mergeNonEmptyFields(curStreamingBubble.card_detail, others),
      };

      // 初始化 content 字段（如果不存在）
      if (curStreamingBubble.card_detail.content === undefined) {
        curStreamingBubble.card_detail.content = "";
      }

      // 如果是覆盖模式，直接替换内容；否则追加
      if (isReplaceMode) {
        curStreamingBubble.card_detail.content = content;
      } else {
        curStreamingBubble.card_detail.content += content;
      }
    }

    setBubules([...streamingBubbleRef.current]);
  };

  const handleDesign = (data: any, addToCanvas: boolean = false) => {
    const { type, cardId, mediaNum, mediaIndex, planId, stepId } = data;

    console.log("handleDesign 收到数据:", {
      type,
      cardId,
      mediaNum,
      mediaIndex,
      data,
    });

    // ===== 处理多图出框 =====
    if (type === "multi_media") {
      console.log("处理 multi_media 出框，cardId:", cardId);

      // 检查 cardId 是否已存在（避免等待重连后重复创建气泡）
      if (cardIdMapRef.current.has(cardId)) {
        console.log("cardId 已存在，跳过创建，cardId:", cardId);
        return;
      }

      // 检查是否属于多步骤任务
      const currentPlan = currentPlanRef.current;
      const isMultiStep = currentPlan && currentPlan.stepNum > 1;

      // 创建新的多图气泡
      const newBubble = {
        role: "assistant",
        card_detail: {
          type: "multi_media",
          cardId,
          mediaNum,
          planId: data.planId,
          stepId: data.stepId,
          contentType: data.contentType || "media",
          icon: data.icon,
          sessionId: data.sessionId,
          taskId: data.taskId,
          is_uncompleted: true,
          // 初始化多图数组
          multiImages: Array.from({ length: mediaNum }, (_, i) => ({
            mediaIndex: i,
            startTime: 0,
            endTime: 0,
            estimateTime: 0,
            media_item: null,
            is_uncompleted: true,
          })),
        },
      };

      // 如果是多步骤任务且有 stepId，将多图内容关联到步骤卡片
      if (isMultiStep && stepId && planId) {
        const key = `${planId}_${stepId}`;
        const bubbleIndex = stepCardBubbleIndexRef.current.get(key);

        if (bubbleIndex !== undefined) {
          const stepCardBubble = streamingBubbleRef.current[bubbleIndex];
          if (stepCardBubble) {
            // 将多图内容添加到 contentBlocks 中
            if (!stepCardBubble.card_detail.contentBlocks) {
              stepCardBubble.card_detail.contentBlocks = [];
            }

            stepCardBubble.card_detail.contentBlocks.push({
              type: "multi_media",
              content: newBubble.card_detail,
            });

            // 记录 cardId 与步骤卡片索引的映射（用于后续回填）
            cardIdMapRef.current.set(cardId, bubbleIndex);

            setBubules([...streamingBubbleRef.current]);
          }
        } else {
          // 未找到步骤卡片，可能该步骤没有文本，只有图片，需要创建新的步骤卡片
          console.log(
            "【multi_media】未找到步骤卡片，自动创建，key:",
            key,
            "stepId:",
            stepId,
            "planId:",
            planId,
          );

          // 从 plan 信息中获取步骤标题
          const stepInfo = currentPlanRef.current?.steps?.find(
            (s) => String(s.stepId) === String(stepId),
          );
          const stepTitle =
            stepInfo?.displayTitle ||
            stepInfo?.stepTitle ||
            $t("global-1688-ai-app.ChatContent.bz", `步骤${stepId}`, [stepId]);

          const stepCardBubble = {
            role: "assistant",
            card_detail: {
              type: "step_card",
              stepId,
              stepTitle,
              planId,
              is_uncompleted: true,
              contentBlocks: [
                {
                  type: "multi_media",
                  content: newBubble.card_detail,
                },
              ],
            },
            _bubbleId: `step_card_${planId}_${stepId}_${Date.now()}`,
          };

          // 按照 stepId 顺序插入
          const newBubbleIndex = insertStepCardInOrder(
            stepCardBubble,
            planId,
            stepId,
          );

          // 记录 cardId 与步骤卡片索引的映射
          if (newBubbleIndex !== undefined) {
            cardIdMapRef.current.set(cardId, newBubbleIndex);
          }

          setBubules([...streamingBubbleRef.current]);
        }
        return;
      }

      // 单步骤任务的多图，正常显示
      streamingBubbleRef.current.push(newBubble);
      // 记录 cardId 与气泡索引的映射
      cardIdMapRef.current.set(cardId, streamingBubbleRef.current.length - 1);

      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // ===== 处理多图内容回填 =====
    if (type === "multi_media_content") {
      console.log(
        "处理 multi_media_content 回填，cardId:",
        cardId,
        "mediaIndex:",
        mediaIndex,
      );

      // 通过 cardId 找到对应的气泡
      const bubbleIndex = cardIdMapRef.current.get(cardId);
      if (bubbleIndex === undefined) {
        console.warn("未找到 cardId 对应的气泡:", cardId);
        return;
      }

      const targetBubble = streamingBubbleRef.current[bubbleIndex];
      if (!targetBubble) {
        console.warn("气泡数据不存在:", bubbleIndex);
        return;
      }

      // 判断是步骤卡片还是独立的多图气泡
      let multiImages: any[];
      let multiMediaBlock: any = null;

      if (targetBubble.card_detail.type === "step_card") {
        // 步骤卡片：在 contentBlocks 中查找对应 cardId 的 multi_media 块
        if (targetBubble.card_detail.contentBlocks) {
          multiMediaBlock = targetBubble.card_detail.contentBlocks.find(
            (block: any) =>
              block.type === "multi_media" && block.content?.cardId === cardId,
          );

          if (multiMediaBlock && multiMediaBlock.content?.multiImages) {
            multiImages = multiMediaBlock.content.multiImages;
          } else {
            console.warn(
              "步骤卡片中未找到匹配 cardId 的多图数据:",
              cardId,
              targetBubble,
            );
            return;
          }
        } else {
          // 向后兼容旧结构
          if (!targetBubble.card_detail.multiMediaContent?.multiImages) {
            console.warn("步骤卡片中没有多图数据:", targetBubble);
            return;
          }
          multiImages = targetBubble.card_detail.multiMediaContent.multiImages;
        }
      } else {
        // 独立的多图气泡
        if (!targetBubble.card_detail.multiImages) {
          console.warn("气泡中没有多图数据:", targetBubble);
          return;
        }
        multiImages = targetBubble.card_detail.multiImages;
      }

      if (mediaIndex !== undefined) {
        // 动态扩展数组：如果 mediaIndex 超出当前数组长度，自动扩展
        if (mediaIndex >= multiImages.length) {
          const extendCount = mediaIndex - multiImages.length + 1;
          console.log(
            `【动态扩展】mediaIndex ${mediaIndex} 超出数组长度 ${multiImages.length}，扩展 ${extendCount} 个位置`,
          );
          for (let i = 0; i < extendCount; i++) {
            multiImages.push({
              mediaIndex: multiImages.length,
              startTime: 0,
              endTime: 0,
              estimateTime: 0,
              media_item: null,
              is_uncompleted: true,
            });
          }
        }

        // 如果有 content 且能正常解析，填充图片数据
        if (data.content) {
          try {
            const { mediaModel } = JSON.parse(data.content);
            const model = Array.isArray(mediaModel) ? mediaModel : [mediaModel];

            const item = {
              media_id: model[0].mediaId,
              media_type: data.contentType,
              media_cover_url: model[0].mediaCoverUrl,
              media_url: model[0].mediaUrl,
              width: model[0].width,
              height: model[0].height,
            };

            multiImages[mediaIndex] = {
              ...multiImages[mediaIndex],
              media_item: item,
              is_uncompleted: false,
            };

            // 检查是否所有图片都已完成
            const allCompleted = multiImages.every(
              (img) => !img.is_uncompleted || img.media_item,
            );
            if (allCompleted) {
              // 所有图片都完成了，更新多图内容的状态
              if (targetBubble.card_detail.type === "step_card") {
                // 如果使用 contentBlocks，更新对应块的状态
                if (multiMediaBlock) {
                  multiMediaBlock.content.is_uncompleted = false;
                } else if (targetBubble.card_detail.multiMediaContent) {
                  // 向后兼容旧结构
                  targetBubble.card_detail.multiMediaContent.is_uncompleted =
                    false;
                }

                // 检查步骤内所有内容块是否都完成
                const allBlocksCompleted =
                  targetBubble.card_detail.contentBlocks?.every(
                    (block: any) => !block.content?.is_uncompleted,
                  );
                if (allBlocksCompleted) {
                  targetBubble.card_detail.is_uncompleted = false;
                  console.log(
                    "【多图处理】步骤内所有内容块已完成，标记步骤为完成",
                  );
                }
              } else {
                targetBubble.card_detail.is_uncompleted = false;
              }
              console.log("所有图片生成完成，cardId:", cardId);

              // 所有图片内容都已接收完成，如果任务还在 running，显示思考中
              if (
                sseStatus.current === SSE_STATUS.RUNNING &&
                !isStatusStart.current
              ) {
                console.log(
                  "【多图内容完成】所有图片内容已接收完成，添加思考中状态",
                );
              }
            }

            if (addToCanvas) {
              if (data.contentType === "image") {
                store.addImgElement([item]);
              } else if (data.contentType === "video") {
                store.addVideoElement([item]);
              }
            }

            console.log("图片回填成功，mediaIndex:", mediaIndex);
          } catch (e) {
            console.error("多图数据解析错误", e);
            // 解析失败，标记为失败状态
            multiImages[mediaIndex] = {
              ...multiImages[mediaIndex],
              is_uncompleted: false,
              failed: true, // 标记为失败
            };

            // 检查是否所有图片都已处理完成（包括失败的）
            const allProcessed = multiImages.every(
              (img) => !img.is_uncompleted,
            );
            if (allProcessed) {
              // 更新多图内容块的状态
              if (targetBubble.card_detail.type === "step_card") {
                if (multiMediaBlock) {
                  multiMediaBlock.content.is_uncompleted = false;
                }
                // 检查步骤内所有内容块是否都完成
                const allBlocksCompleted =
                  targetBubble.card_detail.contentBlocks?.every(
                    (block: any) => !block.content?.is_uncompleted,
                  );
                if (allBlocksCompleted) {
                  targetBubble.card_detail.is_uncompleted = false;
                  console.log(
                    "【多图处理-失败】步骤内所有内容块已完成，标记步骤为完成",
                  );
                }
              }

              if (
                sseStatus.current === SSE_STATUS.RUNNING &&
                !isStatusStart.current
              ) {
                console.log(
                  "【多图处理完成】所有图片已处理完成（含失败），添加思考中状态",
                );
              }
            }
          }
        } else {
          // 没有 content，标记为失败状态（后端未返回图片）
          console.warn(`图片 ${mediaIndex} 没有返回 content，标记为失败`);
          multiImages[mediaIndex] = {
            ...multiImages[mediaIndex],
            is_uncompleted: false,
            failed: true, // 标记为失败
          };

          // 检查是否所有图片都已处理完成（包括失败的）
          const allProcessed = multiImages.every((img) => !img.is_uncompleted);
          if (allProcessed) {
            // 更新多图内容块的状态
            if (targetBubble.card_detail.type === "step_card") {
              if (multiMediaBlock) {
                multiMediaBlock.content.is_uncompleted = false;
              }
              // 检查步骤内所有内容块是否都完成
              const allBlocksCompleted =
                targetBubble.card_detail.contentBlocks?.every(
                  (block: any) => !block.content?.is_uncompleted,
                );
              if (allBlocksCompleted) {
                targetBubble.card_detail.is_uncompleted = false;
                console.log(
                  "【多图处理-空内容】步骤内所有内容块已完成，标记步骤为完成",
                );
              }
            }

            if (
              sseStatus.current === SSE_STATUS.RUNNING &&
              !isStatusStart.current
            ) {
              console.log(
                "【多图处理完成】所有图片已处理完成（含失败），添加思考中状态",
              );
            }
          }
        }
      }

      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // ===== 处理多图进度更新 =====
    if (type === "multi_percent_loading") {
      console.log(
        "处理 multi_percent_loading，cardId:",
        cardId,
        "mediaIndex:",
        mediaIndex,
      );

      const bubbleIndex = cardIdMapRef.current.get(cardId);
      if (bubbleIndex === undefined) {
        console.warn("未找到 cardId 对应的气泡:", cardId);
        return;
      }

      const targetBubble = streamingBubbleRef.current[bubbleIndex];
      if (!targetBubble) {
        return;
      }

      // 判断是步骤卡片还是独立的多图气泡
      let multiImages: any[];
      if (targetBubble.card_detail.type === "step_card") {
        // 步骤卡片：在 contentBlocks 中查找对应 cardId 的 multi_media 块
        if (targetBubble.card_detail.contentBlocks) {
          const multiMediaBlock = targetBubble.card_detail.contentBlocks.find(
            (block: any) =>
              block.type === "multi_media" && block.content?.cardId === cardId,
          );

          if (multiMediaBlock && multiMediaBlock.content?.multiImages) {
            multiImages = multiMediaBlock.content.multiImages;
          } else {
            return;
          }
        } else {
          // 向后兼容旧结构
          if (!targetBubble.card_detail.multiMediaContent?.multiImages) {
            return;
          }
          multiImages = targetBubble.card_detail.multiMediaContent.multiImages;
        }
      } else {
        // 独立的多图气泡
        if (!targetBubble.card_detail.multiImages) {
          return;
        }
        multiImages = targetBubble.card_detail.multiImages;
      }

      if (mediaIndex !== undefined) {
        // 动态扩展数组：如果 mediaIndex 超出当前数组长度，自动扩展
        if (mediaIndex >= multiImages.length) {
          const extendCount = mediaIndex - multiImages.length + 1;
          console.log(
            `【动态扩展-百分比】mediaIndex ${mediaIndex} 超出数组长度 ${multiImages.length}，扩展 ${extendCount} 个位置`,
          );
          for (let i = 0; i < extendCount; i++) {
            multiImages.push({
              mediaIndex: multiImages.length,
              startTime: 0,
              endTime: 0,
              estimateTime: 0,
              media_item: null,
              is_uncompleted: true,
            });
          }
        }

        multiImages[mediaIndex] = {
          ...multiImages[mediaIndex],
          startTime: data.startTime,
          endTime: data.endTime,
          estimateTime: data.estimateTime,
        };
      }

      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // ===== 处理单图 (type === "design") =====
    if (type === "design") {
      // ===== 优先处理多步骤任务中的单图 =====
      const designStepId = data.stepId;
      const designPlanId = data.planId;
      const currentPlan = currentPlanRef.current;
      const isMultiStep = currentPlan && currentPlan.stepNum > 1;

      console.log(
        "【单图处理】type: design, currentPlanRef:",
        currentPlanRef.current,
      );
      console.log(
        "【单图处理】isMultiStep:",
        isMultiStep,
        "designStepId:",
        designStepId,
        "designPlanId:",
        designPlanId,
        "hasContent:",
        !!data.content,
      );

      if (isMultiStep && designStepId && designPlanId) {
        const key = `${designPlanId}_${designStepId}`;
        let bubbleIndex = stepCardBubbleIndexRef.current.get(key);

        // 如果步骤卡片不存在，创建新的
        if (bubbleIndex === undefined) {
          const stepInfo = currentPlan.steps.find(
            (s) => Number(s.stepId) === Number(designStepId),
          );
          const stepTitle =
            stepInfo?.displayTitle ||
            stepInfo?.stepTitle ||
            $t("global-1688-ai-app.ChatContent.bz", `步骤${designStepId}`, [
              designStepId,
            ]);

          const stepCardBubble = {
            role: "assistant",
            card_detail: {
              type: "step_card",
              stepId: designStepId,
              stepTitle,
              planId: designPlanId,
              is_uncompleted: true,
              contentBlocks: [],
            },
            _bubbleId: `step_card_${designPlanId}_${designStepId}_${Date.now()}`,
          };

          // 按照 stepId 顺序插入
          bubbleIndex = insertStepCardInOrder(
            stepCardBubble,
            designPlanId,
            designStepId,
          );
        }

        if (bubbleIndex === undefined) {
          console.error(
            "【单图处理】步骤卡片索引未定义！designPlanId:",
            designPlanId,
            "designStepId:",
            designStepId,
          );
          return;
        }

        const stepCardBubble = streamingBubbleRef.current[bubbleIndex];
        if (!stepCardBubble) {
          console.error(
            "【单图处理】步骤卡片不存在！bubbleIndex:",
            bubbleIndex,
          );
          return;
        }

        console.log("【单图处理】找到步骤卡片，bubbleIndex:", bubbleIndex);

        // 确保 contentBlocks 存在
        if (!stepCardBubble.card_detail.contentBlocks) {
          stepCardBubble.card_detail.contentBlocks = [];
        }

        // 查找或创建 design 块
        let designBlock = stepCardBubble.card_detail.contentBlocks
          .slice()
          .reverse()
          .find((block: any) => block.type === "design");

        // 如果没有 design 块或者当前块已有内容，创建新的
        if (
          !designBlock ||
          (designBlock.content?.media_items &&
            designBlock.content.media_items.length > 0)
        ) {
          designBlock = {
            type: "design",
            content: {
              type: "design",
              media_items: [],
              is_uncompleted: true, // 初始状态为未完成
              ...mergeNonEmptyFields({}, data),
            },
          };
          stepCardBubble.card_detail.contentBlocks.push(designBlock);
          console.log("【单图处理】创建新的 design 块");
        }

        // 卡片头部（元数据）
        const fallbackImg = fallbackImages[store.theme];
        // 判断是否是第一次返回（卡片头部）还是结束返回（失败标记）
        // 如果已经有 title/icon 字段，说明之前已经设置过头部，这次是结束返回
        const isFirstDesign =
          !designBlock.content.title && !designBlock.content.icon;
        const hasEmptyIconTitle = data.icon === "" && data.title === "";

        if (
          !data.content &&
          !data.errContent &&
          !data.errorContent &&
          (isFirstDesign || !hasEmptyIconTitle)
        ) {
          // 第一次返回或正常的元数据更新
          Object.assign(
            designBlock.content,
            mergeNonEmptyFields(designBlock.content, data),
          );
        } else {
          // 图片内容
          if (data.content) {
            try {
              const { mediaModel } = JSON.parse(data.content);
              const model = Array.isArray(mediaModel)
                ? mediaModel
                : [mediaModel];

              const items = model.map((item) => ({
                media_id: item.mediaId,
                media_type: data.contentType,
                media_cover_url: item.mediaCoverUrl,
                media_url: item.mediaUrl,
                width: item.width,
                height: item.height,
              }));

              designBlock.content.media_items = items;
              designBlock.content.is_uncompleted = false; // 图片回填完成，设置为已完成
              console.log("【单图处理】图片回填成功，items:", items);

              if (addToCanvas) {
                if (data.contentType === "image") {
                  store.addImgElement(items);
                } else if (data.contentType === "video") {
                  store.addVideoElement(items);
                }
              }

              // 检查步骤内所有内容块是否都完成
              const allBlocksCompleted =
                stepCardBubble.card_detail.contentBlocks?.every(
                  (block: any) => !block.content?.is_uncompleted,
                );
              if (allBlocksCompleted) {
                stepCardBubble.card_detail.is_uncompleted = false;
                console.log(
                  "【单图处理-成功】步骤内所有内容块已完成，标记步骤为完成",
                );
              }
            } catch (e) {
              designBlock.content.media_items = [
                {
                  media_type: "image",
                  media_cover_url: fallbackImg,
                  media_url: fallbackImg,
                },
              ];
              designBlock.content.is_uncompleted = false; // 错误情况也标记为完成
              designBlock.content.failed = true; // 标记为失败
              console.error("单图数据解析错误", e);

              // 检查步骤内所有内容块是否都完成
              const allBlocksCompleted =
                stepCardBubble.card_detail.contentBlocks?.every(
                  (block: any) => !block.content?.is_uncompleted,
                );
              if (allBlocksCompleted) {
                stepCardBubble.card_detail.is_uncompleted = false;
                console.log(
                  "【单图处理-失败】步骤内所有内容块已完成，标记步骤为完成",
                );
              }
            }
          } else if (data.errorContent || data.errContent) {
            designBlock.content.media_items = [
              {
                media_type: "image",
                media_cover_url: fallbackImg,
                media_url: fallbackImg,
              },
            ];
            designBlock.content.is_uncompleted = false; // 错误情况也标记为完成
            designBlock.content.failed = true; // 标记为失败

            // 检查步骤内所有内容块是否都完成
            const allBlocksCompleted =
              stepCardBubble.card_detail.contentBlocks?.every(
                (block: any) => !block.content?.is_uncompleted,
              );
            if (allBlocksCompleted) {
              stepCardBubble.card_detail.is_uncompleted = false;
              console.log(
                "【单图处理-错误】步骤内所有内容块已完成，标记步骤为完成",
              );
            }
          } else {
            // 没有 content 也没有 errorContent，说明生成失败
            console.warn("【单图处理】收到空 design 消息，显示兜底图", data);
            designBlock.content.media_items = [
              {
                media_type: "image",
                media_cover_url: fallbackImg,
                media_url: fallbackImg,
              },
            ];
            designBlock.content.is_uncompleted = false;
            designBlock.content.failed = true; // 标记为失败
          }
        }

        // 检查步骤内所有内容块是否都完成
        const allBlocksCompleted =
          stepCardBubble.card_detail.contentBlocks?.every(
            (block: any) => !block.content?.is_uncompleted,
          );
        if (allBlocksCompleted) {
          stepCardBubble.card_detail.is_uncompleted = false;
          console.log("【单图处理】步骤内所有内容块已完成，标记步骤为完成");
        }

        console.log("【单图处理】完成，触发渲染");
        setBubules([...streamingBubbleRef.current]);
        return;
      }

      console.log("【单图处理】走单步骤任务逻辑");

      // ===== 单步骤任务的单图逻辑 =====
      const curStreamingBubble = streamingBubbleRef.current.at(-1);
      if (!curStreamingBubble) {
        console.warn("【单图处理】没有找到当前气泡");
        return;
      }

      // ===== 新增：多图场景处理 =====
      if (cardId && mediaNum !== undefined) {
        // 初始化多图数据结构（兼容老的 design 类型多图消息）
        if (!curStreamingBubble.card_detail.cardId) {
          curStreamingBubble.card_detail = {
            ...curStreamingBubble.card_detail,
            ...mergeNonEmptyFields(curStreamingBubble.card_detail, data),
            type: "multi_media", // 设置 type 为 multi_media
            cardId,
            mediaNum,
            planId: data.planId,
            stepId: data.stepId,
            contentType: data.contentType || "media",
            // 初始化多图数组，每张图一个对象
            multiImages: Array.from({ length: mediaNum }, (_, i) => ({
              mediaIndex: i,
              startTime: 0,
              endTime: 0,
              estimateTime: 0,
              media_item: null,
              is_uncompleted: true,
            })),
          };
        }

        // 如果是特定图片的更新（有 mediaIndex）
        if (mediaIndex !== undefined) {
          const multiImages = curStreamingBubble.card_detail.multiImages || [];

          if (data.content) {
            // 图片生成完成，回填结果
            try {
              const { mediaModel } = JSON.parse(data.content);
              const model = Array.isArray(mediaModel)
                ? mediaModel
                : [mediaModel];

              const item = {
                media_id: model[0].mediaId,
                media_type: data.contentType,
                media_cover_url: model[0].mediaCoverUrl,
                media_url: model[0].mediaUrl,
                width: model[0].width,
                height: model[0].height,
              };

              multiImages[mediaIndex] = {
                ...multiImages[mediaIndex],
                media_item: item,
                is_uncompleted: false,
                percent: 100,
              };

              if (addToCanvas) {
                if (data.contentType === "image") {
                  store.addImgElement([item]);
                } else if (data.contentType === "video") {
                  store.addVideoElement([item]);
                }
              }
            } catch (e) {
              console.error("多图数据解析错误", e);
            }
          }

          curStreamingBubble.card_detail.multiImages = multiImages;
        }
        // ===== 原有单图逻辑保持不变 =====
      } else {
        // ===== 单步骤任务的单图逻辑 =====
        const fallbackImg = fallbackImages[store.theme];

        // 判断是否是第一次返回（卡片头部）还是结束返回（失败标记）
        // 如果已经有 title/icon 字段，说明之前已经设置过头部，这次是结束返回
        const isFirstDesign =
          !curStreamingBubble.card_detail.title &&
          !curStreamingBubble.card_detail.icon;
        const hasEmptyIconTitle = data.icon === "" && data.title === "";

        // 卡片头部（第一次返回，只有元数据，没有图片内容）
        if (
          !data.content &&
          !data.errContent &&
          !data.errorContent &&
          (isFirstDesign || !hasEmptyIconTitle)
        ) {
          curStreamingBubble.card_detail = {
            ...curStreamingBubble.card_detail,
            ...mergeNonEmptyFields(curStreamingBubble.card_detail, data),
            media_items: curStreamingBubble.card_detail.media_items || [],
          };
        } else {
          // 有内容返回（图片数据、错误内容或空内容但任务结束）
          if (data.content) {
            // 原有单图逻辑：解析图片数据
            try {
              const { mediaModel } = JSON.parse(data.content);
              const model = Array.isArray(mediaModel)
                ? mediaModel
                : [mediaModel];

              const items = model.map((item) => {
                return {
                  media_id: item.mediaId,
                  media_type: data.contentType,
                  media_cover_url: item.mediaCoverUrl,
                  media_url: item.mediaUrl,
                  width: item.width,
                  height: item.height,
                };
              });
              curStreamingBubble.card_detail.media_items = items;
              curStreamingBubble.card_detail.is_uncompleted = false;
              if (addToCanvas) {
                if (data.contentType === "image") {
                  store.addImgElement(items);
                } else if (data.contentType === "video") {
                  store.addVideoElement(items);
                }
              }
            } catch (e) {
              // 解析失败，显示兜底图
              curStreamingBubble.card_detail.media_items = [
                {
                  media_type: "image",
                  media_cover_url: fallbackImg,
                  media_url: fallbackImg,
                },
              ];
              curStreamingBubble.card_detail.is_uncompleted = false;
              curStreamingBubble.card_detail.failed = true;
              console.error("数据解析错误", e);
            }
          } else if (data.errorContent || data.errContent) {
            // 后端返回了错误内容，显示兜底图
            curStreamingBubble.card_detail.media_items = [
              {
                media_type: "image",
                media_cover_url: fallbackImg,
                media_url: fallbackImg,
              },
            ];
            curStreamingBubble.card_detail.is_uncompleted = false;
            curStreamingBubble.card_detail.failed = true;
          } else {
            // 没有 content 也没有 errorContent，但是有数据返回（可能是空的 design 消息）
            // 这种情况下如果任务已经不是 uncompleted 状态，说明生成失败
            console.warn("【单图处理】收到空 design 消息，显示兜底图", data);
            curStreamingBubble.card_detail.media_items = [
              {
                media_type: "image",
                media_cover_url: fallbackImg,
                media_url: fallbackImg,
              },
            ];
            curStreamingBubble.card_detail.is_uncompleted = false;
            curStreamingBubble.card_detail.failed = true;
          }
        }
      }
      // ===== 百分比更新逻辑 =====
    } else if (type === "percent_loading") {
      // 检查是否是多步骤任务
      const percentStepId = data.stepId;
      const percentPlanId = data.planId;
      const currentPlan = currentPlanRef.current;
      const isMultiStep = currentPlan && currentPlan.stepNum > 1;

      if (isMultiStep && percentStepId && percentPlanId) {
        // 多步骤任务：更新步骤卡片中的 design 块
        const key = `${percentPlanId}_${percentStepId}`;
        const bubbleIndex = stepCardBubbleIndexRef.current.get(key);

        if (bubbleIndex !== undefined) {
          const stepCardBubble = streamingBubbleRef.current[bubbleIndex];
          if (stepCardBubble) {
            // 支持 contentBlocks 结构
            if (stepCardBubble.card_detail.contentBlocks) {
              // 找到最后一个 design 块
              const lastDesignBlock = stepCardBubble.card_detail.contentBlocks
                .slice()
                .reverse()
                .find((block: any) => block.type === "design");

              if (lastDesignBlock && lastDesignBlock.content) {
                Object.assign(lastDesignBlock.content, {
                  startTime: data.startTime,
                  endTime: data.endTime,
                  estimateTime: data.estimateTime,
                });
              }
            } else if (stepCardBubble.card_detail.designContent) {
              // 向后兼容旧结构
              Object.assign(stepCardBubble.card_detail.designContent, {
                startTime: data.startTime,
                endTime: data.endTime,
                estimateTime: data.estimateTime,
              });
            }
          }
        }
      } else {
        // 单步骤任务：存储时间信息，用于前端计算百分比
        const curStreamingBubble = streamingBubbleRef.current.at(-1);
        if (curStreamingBubble) {
          Object.assign(curStreamingBubble.card_detail, {
            startTime: data.startTime,
            endTime: data.endTime,
            estimateTime: data.estimateTime,
          });
        }
      }
      setBubules([...streamingBubbleRef.current]);
    }
  };

  // 基础消息处理
  const handleCommonMsg = (data: any) => {
    const { type, cardId } = data;

    // ===== 处理 text_card 出框 =====
    if (type === "text_card") {
      console.log("处理 text_card 出框，cardId:", cardId);

      // 检查 cardId 是否已存在（避免等待重连后重复创建气泡）
      if (cardIdMapRef.current.has(cardId)) {
        console.log("cardId 已存在，跳过创建，cardId:", cardId);
        return;
      }

      const newBubble = {
        role: "assistant",
        card_detail: {
          type: "text_card",
          cardId,
          planId: data.planId,
          stepId: data.stepId,
          icon: data.icon,
          sessionId: data.sessionId,
          taskId: data.taskId,
          title: data.title,
          content: data.title || "", // 初始显示 title
          contentType: data.contentType,
          is_uncompleted: true,
        },
      };

      streamingBubbleRef.current.push(newBubble);
      cardIdMapRef.current.set(cardId, streamingBubbleRef.current.length - 1);

      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // ===== 处理 text_card_content 内容回填 =====
    if (type === "text_card_content") {
      console.log("处理 text_card_content 回填，cardId:", cardId, data);

      const bubbleIndex = cardIdMapRef.current.get(cardId);
      if (bubbleIndex === undefined) {
        console.warn("未找到 cardId 对应的气泡:", cardId);
        return;
      }

      const targetBubble = streamingBubbleRef.current[bubbleIndex];
      if (!targetBubble) {
        return;
      }

      targetBubble.card_detail = {
        ...targetBubble.card_detail,
        content: data.content,
        is_uncompleted: false,
      };

      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // ===== 其他通用消息处理 =====
    const curStreamingBubble = streamingBubbleRef.current.at(-1);
    if (curStreamingBubble) {
      curStreamingBubble.card_detail = {
        ...curStreamingBubble.card_detail,
        ...mergeNonEmptyFields(curStreamingBubble.card_detail, data),
      };
    }

    setBubules([...streamingBubbleRef.current]);
  };

  // const handlePlanning = (data: any) => {
  //   const curStreamingBubble = streamingBubbleRef.current.at(-1);

  //   if (curStreamingBubble) {
  //     curStreamingBubble.card_detail = {
  //       ...curStreamingBubble.card_detail,
  //       ...mergeNonEmptyFields(curStreamingBubble.card_detail, data),
  //       is_uncompleted: false,
  //     };
  //   }

  //   setBubules([...streamingBubbleRef.current]);
  // };

  // 处理步骤状态
  const handlePlanStatus = (data: any) => {
    const { stepId, planId, status: stepStatus } = data;

    // 只处理完成状态
    if (stepStatus !== "FINISH") {
      return;
    }

    const currentPlan = currentPlanRef.current;
    if (!currentPlan || currentPlan.stepNum <= 1) {
      return;
    }

    const key = `${planId}_${stepId}`;
    const bubbleIndex = stepCardBubbleIndexRef.current.get(key);

    if (bubbleIndex === undefined) {
      console.warn("【plan_status】未找到步骤卡片:", key);
      return;
    }

    const stepCardBubble = streamingBubbleRef.current[bubbleIndex];
    if (stepCardBubble) {
      // 标记步骤完成
      stepCardBubble.card_detail.is_uncompleted = false;
      console.log(
        "【plan_status】步骤完成，标记状态:",
        key,
        "type:",
        stepCardBubble.card_detail.type,
      );

      setBubules([...streamingBubbleRef.current]);
    }
  };

  const handlePlan = (curMsg, options: any = {}) => {
    const { typing = false, speed = 50, step = 5 } = options || {};
    let planItems = [];
    let stepNum = 0;

    try {
      const parsedContent = JSON.parse(curMsg.content);
      stepNum = parsedContent?.stepNum || 0;
      const planId = parsedContent?.planId || "";
      const steps = parsedContent?.steps || [];

      // 保存 plan 信息
      currentPlanRef.current = {
        stepNum,
        planId,
        steps,
      };

      // stepNum 小于等于 1 时不展示任务规划 Card
      // 包括：stepNum === 0 (未返回或默认值) 和 stepNum === 1 (只有一步)
      if (stepNum <= 1) {
        // 移除可能已创建的空 bubble（通常是 handleIntent 创建的）
        const lastBubble = streamingBubbleRef.current.at(-1);
        if (
          lastBubble &&
          lastBubble.card_detail?.content === "" &&
          lastBubble.card_detail?.is_uncompleted === true
        ) {
          streamingBubbleRef.current.pop();
          setBubules([...streamingBubbleRef.current]);
        }
        return;
      }

      const items = steps?.map((item) => {
        return {
          title: item.displayTitle,
          description: item.displayContent,
        };
      });
      planItems = items;
    } catch (e) {}

    // 检查最后一个气泡的类型
    const lastBubble = streamingBubbleRef.current.at(-1);
    const lastBubbleType = lastBubble?.card_detail?.type;

    // 判断最后一个气泡是否可以用于显示 planning
    // 1. 如果已经是 plan/plan_stream 类型，直接更新（即使有 content，可能是打字机效果中途）
    // 2. 如果是空气泡（无 type 或空 content），可以用来显示 planning
    // 3. 如果是其他类型（step_card、text 等），需要创建新气泡
    const canUseLast =
      lastBubble &&
      (lastBubbleType === "plan" ||
        lastBubbleType === "plan_stream" ||
        (!lastBubbleType &&
          lastBubble.card_detail?.is_uncompleted === true &&
          !lastBubble.card_detail?.content));

    // 如果最后一个气泡不合适，创建新的 planning 气泡
    if (!canUseLast) {
      const newPlanningBubble = {
        role: "assistant",
        card_detail: {
          type: curMsg.type || "plan_stream",
          icon: curMsg.icon,
          sessionId: curMsg.sessionId,
          taskId: curMsg.taskId,
          title: curMsg.title,
          content: planItems,
          contentType: curMsg.contentType,
          is_uncompleted: true,
        },
      };
      streamingBubbleRef.current.push(newPlanningBubble);
      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // 如果最后一个气泡已经是 plan 类型，直接更新它（避免 merge 逻辑可能带来的问题）
    if (lastBubbleType === "plan" || lastBubbleType === "plan_stream") {
      lastBubble.card_detail = {
        ...lastBubble.card_detail,
        type: curMsg.type || lastBubbleType,
        icon: curMsg.icon || lastBubble.card_detail.icon,
        sessionId: curMsg.sessionId || lastBubble.card_detail.sessionId,
        taskId: curMsg.taskId || lastBubble.card_detail.taskId,
        title: curMsg.title || lastBubble.card_detail.title,
        content: planItems,
        contentType: curMsg.contentType || lastBubble.card_detail.contentType,
        is_uncompleted: true,
      };
      setBubules([...streamingBubbleRef.current]);
      return;
    }

    // 否则是空气泡，使用打字机效果或直接 merge
    if (typing) {
      if (planItems.length > 0) {
        processPlanTypingEffect(
          { ...curMsg, content: planItems },
          { speed, step },
          (data) => {
            handleCommonMsg(data);
          },
          () => {
            // 当前消息处理完成，处理回调
          },
        );
      } else {
        handleCommonMsg({ ...curMsg, content: planItems });
      }
    } else {
      handleCommonMsg({ ...curMsg, content: planItems });
    }
  };

  // 处理一键优化结果
  const handleOneClickOptResult = (data: any) => {
    try {
      // 解析优化后的商品数据
      const optimizedOfferData =
        typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content;

      if (!optimizedOfferData || !optimizedOfferData.offerId) {
        console.error("优化后的商品数据无效", optimizedOfferData);
        return;
      }

      // 将优化后的商品添加到画布
      store.addOfferElement(optimizedOfferData);

      console.log("一键优化完成，已添加到画布:", optimizedOfferData.offerId);
    } catch (e) {
      console.error("处理一键优化结果失败:", e);
    }
  };

  // 处理商品 loading 状态（创建占位气泡）
  const handleOfferPercentLoading = (data: any) => {
    const { cardId, startTime, endTime } = data;
    const bubbleIndex = cardIdMapRef.current.get(cardId);

    if (bubbleIndex !== undefined && streamingBubbleRef.current[bubbleIndex]) {
      // 已存在，更新进度信息
      streamingBubbleRef.current[bubbleIndex].card_detail = {
        ...streamingBubbleRef.current[bubbleIndex].card_detail,
        startTime,
        endTime,
      };
    } else {
      // 创建 loading 占位气泡，统一使用 type: "offer"
      streamingBubbleRef.current.push({
        role: "assistant",
        card_detail: {
          type: "offer",
          cardId,
          startTime,
          endTime,
          is_uncompleted: true,
        },
      });
      cardIdMapRef.current.set(cardId, streamingBubbleRef.current.length - 1);
    }

    setBubules([...streamingBubbleRef.current]);
  };

  // 处理对话生成商品结果（回填数据到已有气泡）
  const handleChatGeneratedOffer = (data: any) => {
    try {
      const { cardId } = data;
      const generatedOfferData = JSON.parse(data?.content)?.offers || [];
      const bubbleIndex = cardId ? cardIdMapRef.current.get(cardId) : undefined;

      // 辅助函数：更新或创建气泡
      const updateOrCreateBubble = (cardDetail: any) => {
        if (
          bubbleIndex !== undefined &&
          streamingBubbleRef.current[bubbleIndex]
        ) {
          streamingBubbleRef.current[bubbleIndex].card_detail = {
            ...streamingBubbleRef.current[bubbleIndex].card_detail,
            ...cardDetail,
          };
        } else {
          streamingBubbleRef.current.push({
            role: "assistant",
            card_detail: cardDetail,
          });
        }
      };

      if (!generatedOfferData?.length) {
        console.error("生成的商品数据无效", generatedOfferData);
        updateOrCreateBubble({
          type: "offer",
          is_uncompleted: false,
          failed: true,
        });
        setBubules([...streamingBubbleRef.current]);
        return;
      }

      updateOrCreateBubble({
        type: "offer",
        content: generatedOfferData,
        is_uncompleted: false,
      });

      setBubules([...streamingBubbleRef.current]);
      store.addOfferElement(generatedOfferData);
      console.log("对话生成商品完成，已添加到画布:", generatedOfferData);
    } catch (e) {
      console.error("处理对话生成商品结果失败:", e);
    }
  };

  // 发送用户消息
  const sendMessage = useCallback(
    async (data: any) => {
      const { content, files: { image = [], offer = [] } = {} } = data;
      const media_items: any[] = [];
      if (image.length > 0) {
        image.forEach((item) => {
          media_items.push({
            media_url: item.url,
            media_cover_url: item.url,
            media_type: "image",
            ...item,
          });
        });

        store.addImgElement(media_items, "user");
      }

      if (offer.length > 0) {
        offer.forEach((item) => {
          media_items.push({
            media_url: item.images?.[0],
            media_cover_url: item.images?.[0],
            media_type: "link",
            offerId: item.offerId,
          });
        });
        store.addOfferElement(offer, "user");
      }

      // 添加用户消息到界面
      const bubble = {
        role: "user",
        card_detail: {
          media_items: media_items,
          content,
          // is_uncompleted: false,
        },
      };

      streamingBubbleRef.current.push(bubble);
      setBubules([...streamingBubbleRef.current]);
      setTimeout(() => {
        handleHeartbeat();
      });
      fetchStream(data);
    },
    [store, fetchStream],
  );

  // 组件挂载时建立连接
  useEffect(() => {
    if (!sessionId) {
      setCreateDisabled(true);
      setProjectName($t("global-1688-ai-app.ChatContent.newhh", "新会话"));
    } else {
      getDetail(sessionId).then((res) => {
        if (res) {
          const { latestEventId = "", latestTaskId = "", taskStatus } = res;

          if (latestEventId && latestTaskId && taskStatus === "RUNNING") {
            // 请求stream接口, 手动把sseStatus改为running，否则重连成功之前没有思考中状态
            sseStatus.current = SSE_STATUS.RUNNING;
            fetchStream({
              content: "",
              files: {
                image: [],
                offer: [],
              },
              latestEventId,
              latestTaskId,
            });
          }
        }
      });
    }

    // 分享状态下不查用户历史记录
    if (!isShared) {
      getHistoryList();
    }
  }, []);

  useEffect(() => {
    const dispose = autorun(() => {
      if (store.outbox.length > 0) {
        const payload = store.popOutbox();
        if (!payload) return;
        sendMessage(payload);
      }
    });
    return () => dispose();
  }, [store, sendMessage]);

  // 修改会话名称
  const changeProjectName = async (name: string) => {
    const res = await updateTitle({
      title: name,
      sessionId,
    });

    if (res) {
      setProjectName(name);
    }

    return res;
  };

  // 返回首页
  const backHome = () => {
    routeJump("/");
  };

  // 创建新会话
  const createNewSession = () => {
    if (logMaps?.newtask) {
      aplus.record(logMaps.newtask, "CLK");
    }
    // 更新url后刷新页面
    const url = new URL(window.location.href);
    url.searchParams.delete("sessionId");
    window.location.href = url.toString();
  };

  // 切换到当前会话
  const onSelect = (sessionId: string) => {
    if (logMaps?.history) {
      aplus.record(logMaps.history, "CLK", { session_id: sessionId });
    }
    // 切换会话后重新请求历史记录
    const url = new URL(window.location.href);
    url.searchParams.set("sessionId", sessionId);
    window.location.href = url.toString();
  };

  // 删除会话
  const deleteSession = async (_sessionId) => {
    try {
      const res = await removeHistory(_sessionId);
      if (res) {
        // 删除成功, 删除的不是当前会话直接重新请求记录列表
        toast.success(
          $t("global-1688-ai-app.ChatContent.deleteSuccess", "删除成功"),
        );
        if (_sessionId !== sessionId) {
          getHistoryList();
          return true;
        } else {
          // 删除的是当前会话，切换到第一个会话
          const list = await getHistoryList();
          if (list.length > 0) {
            onSelect(list[0].sessionId);
          } else {
            // 删除后列表为空，跳转到新建会话
            const url = new URL(window.location.href);
            url.searchParams.delete("sessionId");
            window.location.href = url.toString();
          }
          return true;
        }
      }
    } catch (e) {
      return false;
    }
  };

  const deleteConfirm = (sessionId) => {
    modal.confirm({
      className: styles.modalConfirm,
      title: $t("global-1688-ai-app.ChatContent.tips", "提示"),
      content: $t(
        "global-1688-ai-app.ChatContent.dewunDe",
        "删除后记录将无法恢复，确认删除？",
      ),
      onOk: () => {
        return deleteSession(sessionId);
      },
    });
  };

  // 终止对话
  const stopSSE = async (sessionId) => {
    console.log("【手动停止】用户点击停止按钮, 设置 taskStatus = STOPPED");
    setIsStopping(true);
    setStatus(Status.LOADING);

    // 设置任务状态为已停止
    taskStatus.current = TASK_STATUS.STOPPED;

    // 设置 SSE 状态为 CLOSE
    sseStatus.current = SSE_STATUS.CLOSE;

    // 清除等待定时器和标志（手动停止时不应该继续请求）
    if (waitingTimerRef.current) {
      console.log(
        "【手动停止】清除等待定时器, timerId:",
        waitingTimerRef.current,
      );
      clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = null;
      isWaitingForResumeRef.current = false;
    } else {
      console.log("【手动停止】没有活跃的等待定时器");
      isWaitingForResumeRef.current = false;
    }

    const res = await stopChat(sessionId);
    // 终止成功
    if (res) {
    } else {
      setIsStopping(false);
      // 终止任务失败，状态改回running
      setStatus(Status.RUNNING);
      toast.error("终止任务失败");
    }
  };

  // 处理用户在卡片上的选择（如 imageChoose），恢复对话
  const handleUserCardResponse = (userInput: string) => {
    console.log("【handleUserCardResponse】用户选择:", userInput);

    // 检查任务状态
    if (taskStatus.current !== TASK_STATUS.WAITING_FOR_USER) {
      console.warn(
        "【handleUserCardResponse】任务状态不是 WAITING_FOR_USER，忽略",
      );
      return;
    }

    const currentSessionId = latestIdsRef.current.sessionId || sessionId;
    const currentTaskId = latestIdsRef.current.taskId;

    if (!currentSessionId || !currentTaskId) {
      console.error("【handleUserCardResponse】缺少 sessionId 或 taskId");
      return;
    }

    // 直接调用 fetchStream 的 resume 模式
    // fetchStream 内部会处理状态、heartbeat、SSE 连接等
    fetchStream({
      mode: "resume",
      userInput,
      latestTaskId: currentTaskId,
      latestSessionId: currentSessionId,
    });
  };

  const getHandlerMap = useCallback(
    ({
      typing,
      speed,
      step,
      addToCanvas = true,
      addUserToCanvas,
      streamTyping = false,
      planStreamTyping,
    }) => {
      // addUserToCanvas 默认跟 addToCanvas 保持一致
      const shouldAddUserToCanvas = addUserToCanvas ?? addToCanvas;
      return [
        {
          type: "session",
          handler: (curMsg: any) => {
            if (curMsg.title) {
              setProjectName(curMsg.title);
            }
          },
        },
        {
          type: "resp",
          handler: (curMsg: any) => {
            if (isShared) {
              return;
            }
            const url = new URL(location.href);
            url.searchParams.set("sessionId", curMsg.sessionId);
            window.history.replaceState(null, "", url.toString());
            setSessionId(curMsg.sessionId);
            setCreateDisabled(false);
          },
        },
        // 识别对话意图，同步记录到task中
        {
          type: "intent",
          handler: handleIntent,
        },
        {
          type: "USER",
          handler: (curMsg) => handleUserMessage(curMsg, shouldAddUserToCanvas),
        },
        {
          type: "text",
          handler: (curMsg) => {
            if (typing) {
              processTypingEffect(
                curMsg,
                { speed, step },
                (chunk) => {
                  handleTextAndAnalyzerChunk(chunk);
                },
                () => {
                  // 当前消息处理完成，处理下一条
                  // processNextMessage();
                },
              );
            } else {
              handleTextAndAnalyzerChunk(curMsg);
            }
          },
        },
        {
          type: "text_stream",
          handler: (curMsg) => {
            if (streamTyping) {
              processTypingEffect(
                curMsg,
                { speed, step },
                (chunk) => {
                  handleTextAndAnalyzerChunk(chunk);
                },
                () => {
                  // 当前消息处理完成，处理下一条
                  // processNextMessage();
                },
              );
            } else {
              handleTextAndAnalyzerChunk(curMsg);
            }
          },
        },
        {
          type: "design_analyzer",
          handler: (curMsg) => {
            let content = "";
            try {
              const parseContent = JSON.parse(curMsg.content);
              if (parseContent?.toolResultType === "text") {
                content = parseContent.content;
              }
            } catch (e) {}

            const contentMode: "text_stream" | "text" =
              curMsg.contentType || "text";

            const lastBubble = streamingBubbleRef.current.at(-1);
            const isLastBubbleAnalyzer =
              lastBubble?.card_detail?.type === "design_analyzer";

            if (contentMode === "text_stream") {
              // ===== 增量累加模式 =====
              // 服务端每次返回完整累加内容（a → aa → aaa），本身就是"流式打字"效果
              // 客户端直接覆盖显示即可，不需要打字机
              if (isLastBubbleAnalyzer) {
                // 直接用完整内容覆盖
                handleTextAndAnalyzerChunk({
                  ...curMsg,
                  content: content,
                  isReplaceMode: true,
                });
              } else {
                // 创建新气泡并填充内容
                handleTextAndAnalyzerChunk({ ...curMsg, content: content });
              }
            } else {
              // ===== 一次性完整模式 =====
              // 服务端一次性返回全部内容，需要客户端打字机效果
              if (isLastBubbleAnalyzer) {
                handleTextAndAnalyzerChunk({
                  ...curMsg,
                  content: "",
                  isReplaceMode: true,
                });
              } else {
                handleTextAndAnalyzerChunk({ ...curMsg, content: "" });
              }

              // 使用打字机效果处理
              if (typing) {
                if (content) {
                  processTypingEffect(
                    { ...curMsg, content },
                    { speed, step },
                    (chunk) => {
                      handleTextAndAnalyzerChunk(chunk);
                    },
                    () => {
                      // 当前消息处理完成
                    },
                  );
                }
              } else {
                if (content) {
                  handleTextAndAnalyzerChunk({ ...curMsg, content });
                }
              }
            }
          },
        },
        {
          type: "error",
          handler: (curMsg) => {
            // 创建一个新的错误气泡，而不是追加到最后一个气泡
            const errorBubble = {
              role: "assistant",
              card_detail: {
                type: "error",
                content:
                  curMsg.script ||
                  curMsg.errorMessage ||
                  $t("global-1688-ai-app.ChatContent.systemError", "系统错误"),
                errorCode: curMsg.errorCode,
                is_uncompleted: false,
              },
            };
            streamingBubbleRef.current.push(errorBubble);
            setBubules([...streamingBubbleRef.current]);
            // processNextMessage();
          },
        },
        {
          type: "design",
          handler: (curMsg) => handleDesign(curMsg, addToCanvas),
        },
        {
          type: "multi_media",
          handler: (curMsg) => handleDesign(curMsg, addToCanvas),
        },
        {
          type: "multi_media_content",
          handler: (curMsg) => handleDesign(curMsg, addToCanvas),
        },
        {
          type: "multi_image",
          handler: (curMsg) => handleDesign(curMsg, addToCanvas),
        },
        {
          type: "knowledge",
          handler: handleCommonMsg,
        },
        {
          type: "plan",
          handler: (curMsg) => handlePlan(curMsg, { typing, speed, step }),
        },
        {
          type: "plan_stream",
          handler: (curMsg) =>
            handlePlan(curMsg, { typing: streamTyping, speed, step }),
        },
        {
          type: "plan_status",
          handler: handlePlanStatus,
        },
        {
          type: "statusChange",
          handler: handleStatusChange,
        },
        {
          type: "percent_loading",
          handler: handleDesign,
        },
        {
          type: "multi_percent_loading",
          handler: (curMsg) => handleDesign(curMsg, addToCanvas),
        },
        {
          type: "text_card",
          handler: handleCommonMsg,
        },
        {
          type: "text_card_content",
          handler: handleCommonMsg,
        },
        // 处理一键优化结果
        {
          type: "oneClickOptResult",
          handler: handleOneClickOptResult,
        },
        {
          type: "offer_percent_loading",
          handler: handleOfferPercentLoading,
        },
        {
          type: "offer",
          handler: handleChatGeneratedOffer,
        },
        // 处理爆款图选择卡片
        {
          type: "imageChoose",
          handler: (curMsg: any) => {
            // 解析 content 字段中的数据
            // 后端返回格式：content 是 JSON 字符串，包含 { toolResultType, images, chooseStatus?, chooseIndex? }
            let parsed: {
              images?: string[];
              chooseStatus?: string;
              chooseIndex?: number;
              multiSelect?: boolean;
              node?: string;
            } = {};
            try {
              parsed = JSON.parse(curMsg.content) || {};
            } catch (err) {
              parsed = {};
              console.error("【imageChoose】解析 content 失败:", err);
            }

            const cardDetail = {
              type: "image-choose",
              title: curMsg.title,
              icon: curMsg.icon,
              sessionId: curMsg.sessionId,
              taskId: curMsg.taskId,
              is_uncompleted: parsed.chooseStatus === undefined,
              ...parsed,
            };

            // 检查上一个 bubble 是否是 handleIntent 创建的空占位 bubble
            // 如果是，则复用它，避免残留空消息
            const lastBubble = streamingBubbleRef.current.at(-1);
            const isEmptyPlaceholder =
              lastBubble?.role === "assistant" &&
              lastBubble?.card_detail?.is_uncompleted === true &&
              !lastBubble?.card_detail?.content &&
              !lastBubble?.card_detail?.type;

            if (isEmptyPlaceholder) {
              // 复用空 bubble
              lastBubble.card_detail = cardDetail;
            } else {
              // 新建 bubble
              streamingBubbleRef.current.push({
                role: "assistant",
                card_detail: cardDetail,
              });
            }
            setBubules([...streamingBubbleRef.current]);
          },
        },
      ];
    },
    [
      handleUserMessage,
      handleTextAndAnalyzerChunk,
      handleDesign,
      handleCommonMsg,
      handleStatusChange,
      handlePlan,
      handlePlanStatus,
      handleOneClickOptResult,
      handleOfferPercentLoading,
      handleChatGeneratedOffer,
    ],
  );

  return (
    <>
      {contextHolder}
      <div className={[styles.chatContent, className].join(" ")}>
        <div className={styles.chatBody} id="chatBody">
          {headerRender ? (
            headerRender({
              title: projectName,
              historyList,
              deleteSession,
              logMaps,
            })
          ) : (
            <Header
              logMaps={logMaps}
              isShared={isShared}
              isMobile={isMobile}
              changeProjectName={changeProjectName}
              backHome={backHome}
              createShare={() => createShareModal(sessionId)}
              createNewSession={createNewSession}
              onSelect={onSelect}
              deleteSession={deleteConfirm}
              title={projectName}
              createDisabled={createDisabled}
              historyList={historyList}
              sessionId={sessionId}
              onCollapseChange={onCollapseChange}
            />
          )}
          <Content
            logKey={logMaps?.listingview}
            ref={contentRef}
            isMobile={isMobile}
            containerClassName={contentContainerClassName}
            isShared={isShared}
            extraRoles={[]}
            onUserCardResponse={handleUserCardResponse}
            heartbeatVisible={heartbeatVisible}
            bubules={[
              ...bubules,
              ...(isStopping
                ? [
                    {
                      role: "taskEndStatus",
                      card_detail: {
                        is_uncompleted: false,
                        type: "stopping",
                        content: $t(
                          "global-1688-ai-app.ChatContent.zad",
                          "正在中断任务，请等待...",
                        ),
                      },
                    },
                  ]
                : []),
            ]}
          />

          {isShared && !isMobile && (
            <>
              {processStatus === ProcessStatus.COMPLETED ? (
                <div className={styles.replayEnd}>
                  {$t("global-1688-ai-app.ChatContent.hfend", "- 回放结束 -")}
                </div>
              ) : (
                <div className={styles.replayEnd}>
                  {$t("global-1688-ai-app.ChatContent.hfing", "- 回放中 -")}
                </div>
                // <div className={styles.replayPlaceHolder} />
              )}
            </>
          )}
          {/* {isMobile && (
            <div className={styles.mobileEnd} />
          )} */}

          {!isShared && !isMobile && (
            <>
              <div className={styles.divider} />
              <InputChat
                logMaps={logMaps}
                uploadCompact
                ref={inputChatRef}
                placeholder={$t(
                  "global-1688-ai-app.InputChat.placeholder",
                  "发送指令，让遨虾为您处理商品链接和图片",
                )}
                inputChatData={inputChatData}
                status={status}
                showUploadOffer={!store.isCustomUser}
                onStatusChange={setStatus}
                onInputChataDataChange={setInputChataData}
                onOfferLinkClick={() => {
                  // 如果正在流式输出，则不打开商品链接分析弹窗
                  if (status === Status.RUNNING) return;
                  setOfferModalOpen(true);
                }}
              />
              <OfferModal
                open={offerModalOpen}
                logKey={logMaps?.uploaditemurl}
                onClose={() => {
                  setOfferModalOpen(false);
                }}
                onImport={(offers) => {
                  inputChatRef.current?.addOffersToChat(offers);
                }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
});
