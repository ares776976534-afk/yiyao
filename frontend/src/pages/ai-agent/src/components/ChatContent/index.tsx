import { useSpm } from "ice";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { autorun } from "mobx";
import { Modal } from "antd";
import Header from "./components/header";
import Content from "./components/content";
import useToast from "@/components/Toast";
import useShare from "@/components/Share";
import InputChat from "@/components/InputChat";
import OfferModal from "@/components/OfferModal";
import { fallbackImages } from "@/components/ChatContent/assets";
import { useStore } from "@/stores/context";
import { $t } from "@/i18n";
import useTypingEffect from "./hooks/useTypingEffect";
import useHeartbeat from "./hooks/useHeartbeat";
import usePolling from "./hooks/usePolling";
import useAutoScroll from "./hooks/useAutoScroll";
import {
  queryHistoryList,
  updateTitle,
  removeHistory,
  getShareRecord,
  createChatCache,
  startChat,
  stopChat,
  resumeChat,
  queryChatDetail,
} from "@/services";
import {
  mergeNonEmptyFields,
  routeJump,
  clearInputUrlParams,
  backHome,
  createNewSession,
  onSelect,
  hasLoadingBubble,
  createInitialBubbleState,
  debugLogger,
  markAllUncompletedAsFailed,
  deduplicateStreamMessages,
} from "./utils";
import { createHandlerMap } from "./handlers";
import type {
  TypeInputChatRef,
  TypeUploadItem,
} from "@/components/InputChat/types";
import type { TypeHandlerContext } from "./handlers/types";
import type {
  BubuleGroup,
  TypeChatProps,
  HistoryItem,
  TypeBubbleState,
  TypeMessage,
} from "./index.d";
import { ProcessStatus } from "./index.d";
import {
  ROLE_CONSTANTS,
  RUNNING_TASK_STATUS_CONSTANTS,
  STATUS_CONSTANTS,
} from "./constants";
import { Status } from "@/components/InputChat/types";
import compareVersion from "@/utils/compareVersion";
import { canvasFeatures } from "@/configs/studioDefaults";
import aplus from "@/utils/log";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";

export { ProcessStatus };

export default forwardRef(function ChatContent(props: TypeChatProps, ref) {
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

  // ===== 状态声明区 =====
  const [bubbles, setBubbles] = useState<BubuleGroup>([]);
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [inputChatData, setInputChataData] = useState<TypeUploadItem[]>([]);
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false);
  const [createDisabled, setCreateDisabled] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get("sessionId") || "";
  });
  const [projectName, setProjectName] = useState<string>("");
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isStopping, setIsStopping] = useState<boolean>(false);

  // ===== Refs =====
  const metaRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");
  const taskIdRef = useRef<string>("");
  const bubbleRef = useRef<TypeBubbleState>(createInitialBubbleState());
  const contentRef = useRef<any>(null);
  const inputChatRef = useRef<TypeInputChatRef>(null);
  const pollMessageQueueRef = useRef<TypeMessage[]>([]);
  const isProcessingPollQueueRef = useRef<boolean>(false);

  window.bubbleRef = bubbleRef;
  window.bubbles = bubbles;

  // ===== 外部依赖 =====
  const store = useStore();
  const [spmA, spmB] = useSpm();
  const toast = useToast();
  const { createShareModal } = useShare({
    logShareKey: logMaps?.share,
    logCopyUrlKey: logMaps?.copyurl,
  });
  const [modal, contextHolder] = Modal.useModal();
  const styles = isMobile ? mobileStyles : pcStyles;

  // ===== 自定义 Hooks =====
  const {
    processTypingEffect,
    processPlanTypingEffect,
    processQueue,
    pauseQueue,
    resumeQueue,
    jumpToResult,
    replayQueue,
    processStatus,
    forceComplete,
  } = useTypingEffect();
  const { heartbeatVisible, onContentReceived, endGeneration } = useHeartbeat(
    RUNNING_TASK_STATUS_CONSTANTS.includes(status) ||
      isStopping ||
      hasLoadingBubble(bubbles),
  );
  const { isAutoScrollEnabled, enableAutoScroll } = useAutoScroll(contentRef);

  // ===== 气泡操作方法 =====
  const bubbleActions = {
    reset: () => {
      bubbleRef.current = createInitialBubbleState();
      setBubbles([]);
    },
    addHeartbeat: () => {
      setBubbles([
        ...bubbleRef.current.data,
        {
          role: ROLE_CONSTANTS.HEARTBEAT,
          card_detail: {
            is_uncompleted: false,
            type: ROLE_CONSTANTS.HEARTBEAT,
          },
        },
      ]);
    },
    removeHeartbeat: () => {
      setBubbles((prev) =>
        prev.filter((item) => item.role !== ROLE_CONSTANTS.HEARTBEAT),
      );
    },
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

  // ===== 流控制方法 =====
  const stopGeneration = () => {
    endGeneration();
    bubbleActions.removeHeartbeat();
  };

  /**
   * 重置到空闲状态：停止生成 + 重置输入框状态
   */
  const resetToIdle = () => {
    stopGeneration();
    setStatus(Status.DEFAULT);
  };

  const getHandlerMap = ({
    typing: optTyping,
    speed: optSpeed,
    step: optStep,
    addToCanvas = true,
    addUserToCanvas,
    streamTyping: optStreamTyping = false,
  }: {
    typing: boolean;
    speed?: number;
    step?: number;
    addToCanvas?: boolean;
    addUserToCanvas?: boolean;
    streamTyping?: boolean;
  }) => {
    // 创建 handler context
    const ctx: TypeHandlerContext = {
      bubbleRef,
      setBubbles,
      setProjectName,
      setSessionId,
      setCreateDisabled,
      mergeNonEmptyFields,
      store,
      fallbackImage: fallbackImages[store.theme],
      // 内部回调
      processTypingEffect,
      processPlanTypingEffect,
      setStatus,
      InputStatus: Status,
    };

    // 从外部 handlers 创建基础映射
    return createHandlerMap(ctx, {
      addToCanvas,
      addUserToCanvas,
      typing: optTyping,
      speed: optSpeed,
      step: optStep,
      streamTyping: optStreamTyping,
    });
  };

  /**
   * 处理轮询消息队列（逐条处理）
   */
  const processPollMessageQueue = () => {
    // 如果正在处理或队列为空，直接返回
    if (
      isProcessingPollQueueRef.current ||
      pollMessageQueueRef.current.length === 0
    ) {
      return;
    }

    isProcessingPollQueueRef.current = true;

    // 取出当前队列快照，清空原队列
    const pendingMessages = [...pollMessageQueueRef.current];
    pollMessageQueueRef.current = [];

    const handlerMaps = getHandlerMap({
      typing,
      speed,
      step,
      addToCanvas: true,
      streamTyping,
    });

    // 逐条处理消息
    const processNextMessage = () => {
      // 当前批次处理完毕
      if (pendingMessages.length === 0) {
        isProcessingPollQueueRef.current = false;
        // 检查是否有新消息到达，继续处理
        if (pollMessageQueueRef.current.length > 0) {
          processPollMessageQueue();
        }
        return;
      }

      // 取第一条消息
      const msg = pendingMessages.shift()!;

      // 处理单条消息
      processQueue({
        messageQueue: [msg],
        handlerMaps,
        onComplete: () => {
          // 用 RAF 调度下一条，确保每帧只渲染一次
          requestAnimationFrame(processNextMessage);
        },
      });
    };

    // 开始处理
    processNextMessage();
  };

  const { startPolling, stopPolling, resetPolling } = usePolling({
    onMessage: (data) => {
      const { title, messages } = data;
      // 收集调试日志并打印（开发环境自动开启）
      debugLogger.log(sessionId, messages);

      // 收到消息时更新标题
      title && setProjectName(data.title);

      if (Array.isArray(messages) && messages.length > 0) {
        // 将消息追加到队列
        pollMessageQueueRef.current.push(...(messages as TypeMessage[]));
        // 尝试处理队列
        processPollMessageQueue();
      }
    },
    onComplete: () => {
      // 轮询结束（包括正常完成、超时、失败等），重置状态
      resetToIdle();
    },
    onError: (error, failCount) => {
      // console.warn(`【usePolling】轮询错误, failCount: ${failCount}`, error);
    },
  });

  const pollingStream = async (payload: any) => {
    const { content, files } = payload;

    const userPreferStore = store.userPrefer;

    const pattern = userPreferStore.agent;
    const { image = [], offer = [] } = files || {};

    setStatus(Status.RUNNING);

    // 设置默认版本号
    metaRef.current = metaRef.current || canvasFeatures.currentVersion;

    try {
      // 调用 chat/v2 接口发起会话
      const result = await startChat({
        sessionId: sessionIdRef.current,
        query: content,
        pattern,
        attachments: image.map((item) => ({
          sourceUrl: item.url,
          mimeType: "image/jpeg",
          width: item.width,
          height: item.height,
        })),
        offerInfos: offer?.map(
          // eslint-disable-next-line @ali/no-unused-vars
          ({ width, height, _offerModuleSize, ...offerInfo }) => offerInfo,
        ),
        sessionMeta: {
          version: metaRef.current,
        },
      });

      if (result.success && result.data) {
        const {
          sessionId: newSessionId,
          taskId: newTaskId,
          title,
          startEventId,
        } = result.data || {};

        title && setProjectName(title);

        if (newSessionId) {
          sessionIdRef.current = newSessionId;
          setSessionId(newSessionId);
        }

        // 保存 taskId，用于后续 resumeChat
        if (newTaskId) {
          taskIdRef.current = newTaskId;
        }

        startPolling(newSessionId, startEventId);
      } else {
        resetToIdle();
      }
    } catch (error) {
      resetToIdle();
    }
  };

  const stopStream = async () => {
    stopGeneration();
    try {
      setIsStopping(true);
      setStatus(Status.LOADING);
      const stopResult = await stopChat(sessionId);
      if (stopResult) {
        stopPolling();
        markAllUncompletedAsFailed(bubbleRef);
      }
    } catch (error) {
      console.error("【stopStream】停止对话失败", error);
    } finally {
      setStatus(Status.DEFAULT);
      setIsStopping(false);
    }
  };

  // 修改会话名称
  const changeProjectName = async (name: string) => {
    try {
      const newProjectName = await updateTitle({
        title: name,
        sessionId,
      });

      newProjectName && setProjectName(name);
    } catch (error) {}
  };

  // 删除会话
  const deleteSession = async (_sessionId) => {
    try {
      const res = await removeHistory(_sessionId);
      if (!res) {
        return false; // 删除失败，返回 false
      }

      toast.success(
        $t("global-1688-ai-app.ChatContent.deleteSuccess", "删除成功"),
      );

      // 删除的是当前会话
      if (_sessionId === sessionId) {
        const list = await getHistoryList();
        if (list.length > 0) {
          onSelect(list[0].sessionId); // 切换到第一个会话
        } else {
          // 列表为空，跳转到新建会话
          const url = new URL(window.location.href);
          url.searchParams.delete("sessionId");
          window.location.href = url.toString();
        }
        return true; // 返回成功
      }

      getHistoryList(); // 删除的不是当前会话，刷新列表
      return true;
    } catch (error) {
      return false; // 异常时返回 false
    }
  };

  const deleteConfirm = (optSessionId) => {
    modal.confirm({
      className: styles.modalConfirm,
      title: $t("global-1688-ai-app.ChatContent.tips", "提示"),
      content: $t(
        "global-1688-ai-app.ChatContent.dewunDe",
        "删除后记录将无法恢复，确认删除？",
      ),
      onOk: () => {
        return deleteSession(optSessionId);
      },
    });
  };

  // 获取分享数据
  const getShareData = async (shareCode: string) => {
    try {
      const res: any = await getShareRecord({ shareCode });
      if (res) {
        const { title, messages } = res || {};
        title && setProjectName(title);

        onShareMessage?.(res);

        if (messages.length > 0) {
          const deduplicated = deduplicateStreamMessages(messages);

          processQueue({
            messageQueue: deduplicated,
            handlerMaps: getHandlerMap({
              typing,
              speed,
              step,
              addToCanvas: true,
              streamTyping,
            }),
          });
        } else {
          // 无消息时也标记为完成
          forceComplete();
        }
      } else {
        // 接口返回空数据时标记为完成
        forceComplete();
      }
    } catch (error) {
      // 接口异常时强制结束播放状态
      console.error("[getShareData] 获取分享数据失败:", error);
      forceComplete();
    }
  };

  const updateSessionId = (newSessionId: string) => {
    const url = new URL(location.href);
    url.searchParams.set("sessionId", newSessionId);
    window.history.replaceState(null, "", url.toString());
    setCreateDisabled(false);
    onSessionChange?.(newSessionId);
    clearInputUrlParams();
  };

  /**
   * 处理用户在卡片上的选择（如 imageChoose），恢复对话
   * v2 格式：{ resumePoint, chooseStatus, chooseIndex? }
   */
  const handleUserCardResponse = async (userInput: {
    resumePoint?: string;
    chooseStatus: "accept" | "refuse";
    chooseIndex?: number | number[];
  }) => {
    if (!sessionId || !taskIdRef.current) {
      console.error("【handleUserCardResponse】缺少 sessionId 或 taskId");
      return;
    }

    const { resumePoint, chooseStatus, chooseIndex } = userInput;

    setStatus(Status.RUNNING);
    bubbleActions.addHeartbeat();

    try {
      const result = await resumeChat({
        sessionId,
        taskId: taskIdRef.current,
        resumePoint,
        feedback: {
          chooseStatus,
          chooseIndex,
        },
        sessionMeta: {
          version: metaRef.current,
        },
      });

      if (result.success && result.data) {
        const { startEventId, taskId: newTaskId, title } = result.data;

        // resumeChat 成功后更新 taskId
        if (newTaskId) {
          taskIdRef.current = newTaskId;
        }

        title && setProjectName(title);
        startPolling(sessionId, startEventId);
      } else {
        resetToIdle();
      }
    } catch (error) {
      console.error("【handleUserCardResponse】接口异常:", error);
      resetToIdle();
    }
  };

  // 发送用户消息
  const sendMessage = async (data: any) => {
    enableAutoScroll();
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

      store.addImgElement(media_items);
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
      store.addOfferElement(offer);
    }

    // 添加用户消息到界面
    const bubble = {
      role: "user",
      card_detail: {
        media_items: media_items,
        content,
      },
    };

    bubbleRef.current.data.push(bubble);
    setBubbles([...bubbleRef.current.data]);
    setTimeout(bubbleActions.addHeartbeat);
    pollingStream(data);
  };

  useLayoutEffect(() => {
    // 监听 bubbles 变化来控制思考中状态
    // 只在 RUNNING 状态下才启动空档定时器
    if (status === Status.RUNNING) {
      const lastBubble = bubbles[bubbles.length - 1];
      const isHeartbeat = lastBubble?.role === ROLE_CONSTANTS.HEARTBEAT;
      const isUserMessage = lastBubble?.role === ROLE_CONSTANTS.USER;

      // 只有 AI 消息（不是 heartbeat 也不是用户消息）才触发定时器重置
      // 用户消息不应该触发，否则会在发送消息时就启动定时器
      if (!isHeartbeat && !isUserMessage && bubbles.length > 0) {
        // console.log("【onHeartbeat】重置心跳检测", bubbles);
        onContentReceived();
      }
    }
  }, [bubbles, status, onContentReceived]);

  // bubbles 变化时滚动到底部（用户交互后暂停）
  useLayoutEffect(() => {
    if (bubbles.length > 0 && isAutoScrollEnabled()) {
      contentRef.current?.scrollToBottom();
    }
  }, [bubbles, isAutoScrollEnabled]);

  // 思考中出现时滚动到底部（用户交互后暂停）
  useLayoutEffect(() => {
    if (heartbeatVisible && isAutoScrollEnabled()) {
      contentRef.current?.scrollToBottom();
    }
  }, [heartbeatVisible, isAutoScrollEnabled]);

  // 组件挂载时建立连接
  useEffect(() => {
    const handleInit = () => {
      if (sessionId) {
        queryChatDetail(sessionId).then((res) => {
          const { success, data = {} } = res || {};
          if (success && data) {
            const { title, messages, latestEventId, latestTaskId, taskStatus } =
              data || {};

            title && setProjectName(title);

            // 保存 taskId，用于后续 resumeChat
            if (latestTaskId) {
              taskIdRef.current = latestTaskId;
            }

            metaRef.current = data?.meta?.version;

            // 根据版本判断是否需要添加到画布
            const needAddToCanvas = compareVersion(
              metaRef.current,
              ">=",
              canvasFeatures.canvasMemory.version,
            );

            if (Array.isArray(messages) && messages.length > 0) {
              const deduplicated = deduplicateStreamMessages(
                messages as TypeMessage[],
              );
              processQueue({
                messageQueue: deduplicated,
                handlerMaps: getHandlerMap({
                  typing: historyTyping,
                  speed,
                  step,
                  addToCanvas: needAddToCanvas,
                  addUserToCanvas: false, // 历史回放时用户消息不插入画布
                }),
              });
            }

            if (
              RUNNING_TASK_STATUS_CONSTANTS.includes(taskStatus) &&
              latestEventId
            ) {
              // 断线重连后任务没结束 从latestEventId处继续轮询
              // 只有在没有 loading 气泡时才添加 heartbeat
              if (!hasLoadingBubble(bubbleRef.current.data)) {
                bubbleActions.addHeartbeat();
              }
              setStatus(Status.RUNNING);
              startPolling(sessionId, latestEventId);
            }
          }
        });
      } else {
        setCreateDisabled(true);
        setProjectName($t("global-1688-ai-app.ChatContent.newhh", "新会话"));
      }

      // 分享状态下不查用户历史记录
      if (!isShared) {
        getHistoryList();
      }
    };

    handleInit();

    // 组件卸载时清理定时器
    return () => {
      endGeneration();
      resetPolling();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (status === Status.PAUSED) {
      stopStream();
    }
    // eslint-disable-next-line
  }, [status]);

  useEffect(() => {
    if (isShared) {
      onShareStatusChange?.(processStatus);
    }
    // eslint-disable-next-line
  }, [isShared, processStatus]);

  useEffect(() => {
    if (isShared) {
      const query = new URLSearchParams(window.location.search);
      const shareCode = query.get("shareCode") || propsShareCode || "";
      getShareData(shareCode);
    }
    // eslint-disable-next-line
  }, [isShared, propsShareCode]);

  useEffect(() => {
    if (sessionId) {
      sessionIdRef.current = sessionId;
      updateSessionId(sessionId);
    }
    // eslint-disable-next-line
  }, [sessionId]);

  useEffect(() => {
    if (inputChatRef.current) {
      store.setInputChat(inputChatRef.current);
    }

    const dispose = autorun(() => {
      if (store.outbox.length > 0) {
        const payload = store.popOutbox();
        if (!payload) return;
        sendMessage(payload);
      }
    });
    return () => dispose();

    // eslint-disable-next-line
  }, [store]);

  useImperativeHandle(
    ref,
    () => ({
      pause: pauseQueue,
      play: () => {
        resumeQueue();
      },
      rePlay: () => {
        bubbleActions.reset();
        replayQueue({
          handlerMaps: getHandlerMap({
            typing,
            speed,
            step,
            addToCanvas: false,
            streamTyping: planStreamTyping,
          }),
        });
      },
      jumpToResult: () => {
        jumpToResult();
        contentRef.current?.scrollToBottom();
      },
      doTheSame: (jumpPageParams) => {
        const userInfo = bubbleRef.current.data.find(
          (value) => value.role === "user",
        );
        if (!userInfo) return;
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
        }).then((res) => {
          routeJump("studio", {
            cacheId: res,
            spm: `${spmA}.${spmB}.do-the-same`,
            ...(jumpPageParams || {}),
          });
        });
      },
    }),
    // eslint-disable-next-line
    [pauseQueue, resumeQueue, jumpToResult, contentRef.current],
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
              createNewSession={() => {
                if (logMaps?.newtask) {
                  aplus.record(logMaps.newtask, "CLK");
                }
                createNewSession();
              }}
              onSelect={(...args) => {
                if (logMaps?.history) {
                  aplus.record(logMaps.history, "CLK", {
                    session_id: sessionId,
                  });
                }
                onSelect(...args);
              }}
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
            containerClassName={contentContainerClassName}
            isMobile={isMobile}
            isShared={isShared}
            heartbeatVisible={heartbeatVisible}
            bubbles={[
              ...bubbles,
              ...(isStopping
                ? [
                    {
                      role: "taskEndStatus",
                      card_detail: {
                        is_uncompleted: false,
                        type: STATUS_CONSTANTS.STOPPING,
                        content: $t(
                          "global-1688-ai-app.ChatContent.zad",
                          "正在中断任务，请等待...",
                        ),
                      },
                    },
                  ]
                : []),
            ]}
            onUserCardResponse={handleUserCardResponse}
          />

          {isShared && !isMobile && (
            <div className={styles.replayEnd}>
              {processStatus === ProcessStatus.COMPLETED
                ? $t("global-1688-ai-app.ChatContent.hfend", "- 回放结束 -")
                : $t("global-1688-ai-app.ChatContent.hfing", "- 回放中 -")}
            </div>
          )}

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
