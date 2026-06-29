import { useRef, useState, useEffect } from "react";
import { debounce } from "lodash";
import { useSelectProductStore } from "@/stores/select-product";
import { message } from "antd";
import Thinking from "../components/LeftComponents/Thinking";
import IconLogo from "../components/LeftComponents/IconLogo";
import { StatusEnum } from "../config";
import { useChatHistory } from "../components/ChatHistory/useChatHistory";
import { serviceBaseUrl } from "@/utils/env";
import { checkAuthAndLogin } from "@/utils/login";
import { $t } from "@/i18n";
import { DEFAULT_LANG } from "@/i18n/constants";

interface UseChatStreamOpt {
  isReplay?: boolean;
  replayInterval?: number;
}

export enum ReplayStatus {
  INIT = "INIT",
  REPLAYING = "REPLAYING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  NONE = "NONE",
}

let httpController: AbortController | null = null;
let _userRequest: any = null;

export const handleScroll = (top?: number) => {
  const scrollFn = () => {
    const leftContainer = document.getElementById("left-container");
    if (leftContainer) {
      leftContainer.scrollTo({
        top: top || leftContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  debounce(scrollFn, 300)();
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const normalizeGroupId = (id: string) => id.replace(/_t\d+_/, '_');

const findBlockInTree = (blocks: any[], cardId: string): any => {
  for (const block of blocks) {
    if (block?.cardId === cardId) return block;
    if (block?.accordionContent?.length) {
      const found = findBlockInTree(block.accordionContent, cardId);
      if (found) return found;
    }
    if (block?.groupContent?.length) {
      const found = findBlockInTree(block.groupContent, cardId);
      if (found) return found;
    }
  }
  return null;
};

const findGroupByParentId = (blocks: any[], parentId: string): any => {
  const match = (groupId: string) =>
    groupId === parentId ||
    normalizeGroupId(groupId) === parentId ||
    groupId.startsWith(`${parentId}_`);
  for (const block of blocks) {
    if (block?.cardType === 'GROUP' && block?.cardId && match(block.cardId)) {
      return block;
    }
    if (block?.accordionContent?.length) {
      const found = findGroupByParentId(block.accordionContent, parentId);
      if (found) return found;
    }
    if (block?.groupContent?.length) {
      const found = findGroupByParentId(block.groupContent, parentId);
      if (found) return found;
    }
  }
  return null;
};

const replaceBlockInTree = (
  blocks: any[],
  cardId: string,
  newBlock: any,
): { next: any[]; replaced: boolean } => {
  let replaced = false;
  const next = blocks.map((block) => {
    if (block?.cardId === cardId) {
      replaced = true;
      return newBlock;
    }
    if (block?.accordionContent && block.accordionContent.some((item: any) => item?.cardId === cardId)) {
      const { next: nextContent, replaced: rep } = replaceBlockInTree(block.accordionContent, cardId, newBlock);
      if (rep) replaced = true;
      return { ...block, accordionContent: nextContent };
    }
    if (block?.groupContent && block.groupContent.some((item: any) => item?.cardId === cardId)) {
      const { next: nextContent, replaced: rep } = replaceBlockInTree(block.groupContent, cardId, newBlock);
      if (rep) replaced = true;
      return { ...block, groupContent: nextContent };
    }
    return block;
  });
  return { next, replaced };
};

const collectReportCardIdsInGroups = (blocks: any[]): string[] => {
  const ids: string[] = [];
  for (const block of blocks) {
    if (block?.cardType === 'GROUP' && Array.isArray(block?.groupContent)) {
      for (const item of block.groupContent) {
        if (item?.cardType === 'REPORT_CARD' && item?.cardId) ids.push(item.cardId);
      }
    }
    if (block?.accordionContent?.length) {
      ids.push(...collectReportCardIdsInGroups(block.accordionContent));
    }
  }
  return ids;
};

const reformatReportCardsInGroups = (
  blocks: any[],
  formatToBlockFn: (data: any, blks: any[]) => any,
): { next: any[]; changed: boolean } => {
  const cardIds = collectReportCardIdsInGroups(blocks);
  let queue = blocks;
  let changed = false;
  for (const cardId of cardIds) {
    const block = findBlockInTree(queue, cardId);
    if (!block) continue;
    const newBlock = formatToBlockFn(block, queue);
    if (newBlock) {
      const { next } = replaceBlockInTree(queue, cardId, newBlock);
      queue = next;
      changed = true;
    }
  }
  return { next: queue, changed };
};

const pushOrReplaceInGroupContent = (
  blocks: any[],
  parentId: string,
  newBlock: any,
): { next: any[]; done: boolean } => {
  const childId = newBlock?.cardId;
  let done = false;
  const next = blocks.map((block) => {
    if (block?.cardId === parentId && block?.cardType === "GROUP") {
      done = true;
      const content = block.groupContent ?? [];
      const at = content.findIndex((item: any) => item?.cardId === childId);
      const nextContent = at >= 0
        ? content.map((item: any, ix: number) => (ix === at ? newBlock : item))
        : [...content, newBlock];
      return { ...block, groupContent: nextContent };
    }
    if (block?.accordionContent?.length) {
      const { next: nextContent, done: ok } = pushOrReplaceInGroupContent(
        block.accordionContent,
        parentId,
        newBlock,
      );
      if (ok) done = true;
      return { ...block, accordionContent: nextContent };
    }
    if (block?.groupContent?.length) {
      const { next: nextContent, done: ok } = pushOrReplaceInGroupContent(
        block.groupContent,
        parentId,
        newBlock,
      );
      if (ok) done = true;
      return { ...block, groupContent: nextContent };
    }
    return block;
  });
  return { next, done };
};

export default (
  formatFnList: ((data: any, blocks: any[]) => any)[],
  opt: UseChatStreamOpt = {},
) => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [expandedPanelKeys, setExpandedPanelKeys] = useState<string[]>([]);
  const queueRef = useRef<any[]>([]);
  const currentModuleIdRef = useRef<string>("");
  const pendingByParentRef = useRef<Map<string, any[]>>(new Map());
  const streamOrderRef = useRef(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const selectProductStore = useSelectProductStore();
  const [sessionId, setStateSessionId] = useState<string>("");
  const { setSessionId, getSessionId, setTaskId, getTaskId } =
    selectProductStore;
  const [processStatus, setProcessStatus] = useState<any>({
    taskStatus: "SUSPEND",
  });
  const [isReplay, setIsReplay] = useState(false);
  const [showReplayResult, setShowReplayResult] = useState(false);
  const isReplayRef = useRef(false);
  const showReplayResultRef = useRef(false);
  const [replayStatus, setReplayStatus] = useState<ReplayStatus>(
    ReplayStatus.NONE,
  );
  const [userRequest, setUserRequest] = useState<any>({});
  const { replayInterval = 1000 } = opt;
  const { shareCode } = useChatHistory();
  const [hasRequestError, setHasRequestError] = useState<boolean>(false);

  const handleSetUserRequest = (request: any) => {
    if (_userRequest) return;
    _userRequest = request;
    setUserRequest(request);
    selectProductStore.setUserRequest(request);
  };

  const handleDeleyPending = async () => {
    if (isReplayRef.current) {
      if (!showReplayResultRef.current) {
        setReplayStatus(ReplayStatus.REPLAYING);
        await sleep(replayInterval);
      } else {
        return;
      }
    } else {
      return;
    }
  };

  const flushPendingByParent = () => {
    if (pendingByParentRef.current.size === 0) return;
    let queue = queueRef.current;
    let changed = false;
    const nextPending = new Map<string, any[]>();
    pendingByParentRef.current.forEach((pendingBlocks, parentId) => {
      const parent = findGroupByParentId(queue, parentId);
      if (parent?.cardType === "GROUP") {
        const groupCardId = parent.cardId;
        for (const blk of pendingBlocks) {
          const { next } = pushOrReplaceInGroupContent(queue, groupCardId, blk);
          queue = next;
          changed = true;
        }
      } else {
        nextPending.set(parentId, pendingBlocks);
      }
    });
    pendingByParentRef.current = nextPending;
    if (changed) {
      queueRef.current = queue;
      setBlocks([...queue]);
    }
  };

  const formatToBlock = (originData: any, _blocks: any[]) => {
    if (originData?.cardType === "GROUP") {
      return { ...originData, groupContent: originData.groupContent ?? [] };
    }
    for (const fn of formatFnList) {
      if (originData?.cardType === "THINKING") {
        return {
          ...originData,
          hide: originData?.thinkingStatus !== "THINKING",
          LeftComponent: Thinking,
        };
      }

      if (originData?.cardType === "ICON_TITLE_CARD") {
        return {
          ...originData,
          // hide: originData?.thinkingStatus !== "ICON_TITLE_CARD",
          LeftComponent: IconLogo,
        };
      }

      const block = fn(originData, _blocks);

      if (block) {
        return block;
      }
    }
    return null;
  };

  const handleStreamData = (data: any) => {
    const { cardId, cardSubType, cardType, needHide } = data;

    // 检测 ERROR 状态的 MODULE_HEADER，通知 store
    if (cardType === "MODULE_HEADER" && data?.status === "ERROR") {
      selectProductStore.setLastError(data);
    }

    if (cardType === "USER_REQUEST") {
      if (!userRequest.cardId) {
        handleSetUserRequest(data);
      }
    }

    if (cardType === "TASK_PROGRESS") {
      setProcessStatus(data);
      if (data.taskStatus === "COMPLETED") {
        setTaskId("");
      }
    }
    if (cardSubType === "MODULE_PREVIEW_START") {
      streamOrderRef.current += 1;
      console.log(`[stream顺序 ${streamOrderRef.current}] MODULE_PREVIEW_START cardId=${cardId} cardType=${cardType}`);
      currentModuleIdRef.current = cardId;
      setExpandedPanelKeys((prevKeys) => [...prevKeys, cardId]);
      const moduleStartBlock = formatToBlock(data, queueRef.current);
      if (moduleStartBlock) {
        queueRef.current.push(moduleStartBlock);
        setBlocks([...queueRef.current]);
      }
    } else if (cardSubType === "MODULE_PREVIEW_END") {
      streamOrderRef.current += 1;
      console.log(`[stream顺序 ${streamOrderRef.current}] MODULE_PREVIEW_END cardId=${cardId}`);
      const targetBlock = queueRef.current.find(
        (block) => block.cardId === currentModuleIdRef.current,
      );
      if (targetBlock && needHide) {
        targetBlock.needHide = true;
        targetBlock.hide = true; // 同时设置 hide 属性，让 LeftContainer 能正确过滤
        setBlocks([...queueRef.current]); // 更新状态以触发重新渲染
      }

      currentModuleIdRef.current = "";
    } else {
      streamOrderRef.current += 1;
      const { parentId } = data;
      console.log(`[stream顺序 ${streamOrderRef.current}] cardType=${cardType} cardId=${data.cardId} parentId=${parentId ?? '(无)'}`);
      const currentBlock = formatToBlock(data, queueRef.current);
      if (currentBlock) {
        const { cardId: currentBlockId } = currentBlock;
        const { next: nextQueue, replaced } = replaceBlockInTree(
          queueRef.current,
          currentBlockId,
          currentBlock,
        );
        queueRef.current = nextQueue;
        if (replaced) {
          flushPendingByParent();
          const { next: afterReformat, changed: reformatChanged } = reformatReportCardsInGroups(
            queueRef.current,
            formatToBlock,
          );
          if (reformatChanged) queueRef.current = afterReformat;
          setBlocks([...queueRef.current]);
        } else {
          if (cardType === "GROUP") {
            if (currentModuleIdRef.current) {
              const targetBlock = queueRef.current.find(
                (blk: any) => blk.cardId === currentModuleIdRef.current,
              );
              if (targetBlock) {
                targetBlock.accordionContent = targetBlock.accordionContent ?? [];
                targetBlock.accordionContent.push(currentBlock);
              } else {
                queueRef.current = [...queueRef.current, currentBlock];
              }
            } else {
              queueRef.current = [...queueRef.current, currentBlock];
            }
            flushPendingByParent();
            const { next: afterReformatG, changed: reformatChangedG } = reformatReportCardsInGroups(
              queueRef.current,
              formatToBlock,
            );
            if (reformatChangedG) queueRef.current = afterReformatG;
            setBlocks([...queueRef.current]);
          } else if (parentId) {
            const parent = findGroupByParentId(queueRef.current, parentId);
            if (parent?.cardType === "GROUP") {
              const { next: afterPush } = pushOrReplaceInGroupContent(
                queueRef.current,
                parent.cardId,
                currentBlock,
              );
              queueRef.current = afterPush;
              flushPendingByParent();
              const { next: afterReformat, changed: reformatChanged } = reformatReportCardsInGroups(
                queueRef.current,
                formatToBlock,
              );
              if (reformatChanged) queueRef.current = afterReformat;
              setBlocks([...queueRef.current]);
            } else {
              const list = pendingByParentRef.current.get(parentId) ?? [];
              list.push(currentBlock);
              pendingByParentRef.current.set(parentId, list);
              flushPendingByParent();
              const { next: afterReformatP, changed: reformatChangedP } = reformatReportCardsInGroups(
                queueRef.current,
                formatToBlock,
              );
              if (reformatChangedP) queueRef.current = afterReformatP;
              setBlocks([...queueRef.current]);
            }
          } else {
            if (currentModuleIdRef.current) {
              const targetBlock = queueRef.current.find(
                (blk: any) => blk.cardId === currentModuleIdRef.current,
              );
              if (targetBlock) {
                targetBlock.accordionContent = targetBlock.accordionContent ?? [];
                targetBlock.accordionContent.push(currentBlock);
              } else {
                queueRef.current = [...queueRef.current, currentBlock];
              }
            } else {
              queueRef.current = [...queueRef.current, currentBlock];
            }
            flushPendingByParent();
            const { next: afterReformatN, changed: reformatChangedN } = reformatReportCardsInGroups(
              queueRef.current,
              formatToBlock,
            );
            if (reformatChangedN) queueRef.current = afterReformatN;
            setBlocks([...queueRef.current]);
          }
        }
      }
      if (isReplayRef.current) {
        handleScroll();
      }
    }
  };

  const readChunk = async (reader, decoder, buffer, onStream) => {
    try {
      const { done, value } = await reader.read();

      if (done) {
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      // 保留最后一个可能不完整的行
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          continue;
        }

        // 处理 data: 开头的行
        if (trimmedLine.startsWith("data:")) {
          const data = trimmedLine.slice(5).trim(); // 移除 'data:' 前缀

          // 处理心跳数据：heartbeat 或 heartbeat:timestamp 格式
          if (data.startsWith("heartbeat")) {
            continue;
          }

          // 处理连接关闭信号
          if (data === "connection_closing") {
            setIsStreaming(false);
            return;
          }

          try {
            const parsedData = JSON.parse(data);

            if (parsedData.status === "allDone") {
              setReplayStatus(ReplayStatus.COMPLETED);
              setIsStreaming(false);
              return;
            }

            if (parsedData.sessionId) {
              setSessionId(parsedData.sessionId);
              setStateSessionId(parsedData.sessionId);
            }
            if (parsedData.taskId) {
              setTaskId(parsedData.taskId);
            }
            if (parsedData.success === false) {
              setIsStreaming(false);
              message.error(parsedData?.data?.errorMessage || $t("global-1688-ai-app.select-product.useChatStream.qqfailed", "请求失败"));
              return;
            }
            await handleDeleyPending();
            onStream(parsedData);
          } catch (parseError) {
            console.warn("[SSE] JSON解析失败:", data, parseError);
          }
        }
      }
      readChunk(reader, decoder, buffer, onStream);
    } catch (error) {
      console.error("[SSE] 读取数据时出错:", error);
    }
  };

  const request = async ({
    fetchUrl: _fetchUrl,
    params,
    onStream,
  }: {
    fetchUrl: string;
    params: any;
    onStream: (data: any) => void;
  }) => {
    httpController = new AbortController();
    try {
      setIsStreaming(true);
      setHasRequestError(false); // 请求开始时重置错误状态
      selectProductStore.setStatus(StatusEnum.RUNNING);
      const response = await fetch(_fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          'X-I18n-Language': DEFAULT_LANG,
        },
        credentials: "include",
        body: JSON.stringify({
          sessionId: getSessionId() || "",
          taskId: getTaskId(),
          // params?.extInfos?.executeStatus === "new" ? "" : getTaskId() || "",
          ...params,
        }),
        signal: httpController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      // 检查响应是否为流式数据
      if (!response.body) {
        throw new Error(
          $t(
            "global-1688-ai-app.select-product.useChatStream.xytwk",
            "响应体为空",
          ),
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // 开始读取流式数据
      readChunk(reader, decoder, buffer, onStream);
    } catch (err: unknown) {
      if ((err as any)?.name !== 'AbortError') {
        setHasRequestError(true); // 请求失败时设置错误状态
        if ((err as any)?.message?.indexOf('401') > -1) {
          checkAuthAndLogin({
            onSuccess: () => {
              request({
                fetchUrl: _fetchUrl,
                params,
                onStream: handleStreamData,
              });
            },
          });
        }
        console.error("[SSE] 请求失败:", err);
      }
      setIsStreaming(false);
    }
  };

  const getStream = ({
    fetchUrl: _fetchUrl,
    params = {},
  }: {
    fetchUrl: string;
    params: any;
  }) => {
    _userRequest = null;
    if (
      _fetchUrl !== `${serviceBaseUrl}/opp/share/replayByShareCode` &&
      shareCode
    ) {
      message.error("分享链接暂不支持对话");
      return;
    }
    return request({ fetchUrl: _fetchUrl, params, onStream: handleStreamData });
  };

  const pushBlock = (block: any) => {
    handleStreamData(block);
  };

  const clearBlocks = ({
    clearReplay = true,
  }: { clearReplay?: boolean } = {}) => {
    httpController?.abort();
    _userRequest = null;
    if (clearReplay) {
      isReplayRef.current = false;
      setIsReplay(false);
    }
    selectProductStore.setFormSubmitted(false);
    selectProductStore.setStatus(StatusEnum.INIT);
    setBlocks([]);
    queueRef.current = [];
    pendingByParentRef.current.clear();
    streamOrderRef.current = 0;
    setHasRequestError(false); // 清空时重置错误状态
  };

  useEffect(() => {
    isReplayRef.current = isReplay;
  }, [isReplay]);

  useEffect(() => {
    showReplayResultRef.current = showReplayResult;
  }, [showReplayResult]);

  return {
    blocks,
    expandedPanelKeys,
    setExpandedPanelKeys,
    getStream,
    isStreaming,
    pushBlock,
    processStatus,
    clearBlocks,
    sessionId,
    replayStatus,
    setIsReplay,
    isReplay,
    showReplayResult,
    setShowReplayResult,
    setSessionId,
    setTaskId,
    userRequest,
    hasRequestError,
  };
};
