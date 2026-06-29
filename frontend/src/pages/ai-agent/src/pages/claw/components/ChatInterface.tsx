import React, { useState, useRef, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Button, message, Modal, Tooltip } from 'antd';
import View from "@alife/channel-fe-materials-react-appear";
import DeployProgressOverlay from '@/pages/claw/components/DeployProgressOverlay';
// import MarkdownContent from '@/pages/claw/components/Markdown';
import { AlphaMarkdown as MarkdownContent } from '@/pages/claw/components/AlphaMarkdown';
import { alpha_claw_logo } from '@/pages/claw/components/constants';
import aplus from "@/utils/log";
import { createClaw, uploadFile } from '@/services/claw';
import type { TypeClawChatInterfaceProps, TypeClawChatMessage, TypeClawToolCall } from './clawPageTypes';
import type { TypeClawChatWsConfig } from './clawChatProtocolTypes';
import type { TypeAlphaClawSettingsMenuId } from './AlphaClawSettingsPanel/types';
import { useClawChatWs } from './hooks/useClawChatWs';
import AlphaClawSettingsPanel from './AlphaClawSettingsPanel';
import { ClawChatComposer } from './ClawChatComposer';
import type { TypeClawAttachmentItem, TypeClawChatComposerRef } from './ClawChatComposer/types';
import { parseClawUserMessageWire } from './clawUserMessageWire';
import FileSystemPanel from './FileSystemPanel';
import styles from '../chat/index.module.scss';

const HELP_ICON_URL = 'https://img.alicdn.com/imgextra/i4/O1CN01YYtMTB25HyPdEOmCg_!!6000000007502-55-tps-20-20.svg';
const CONFIG_ICON_URL = 'https://img.alicdn.com/imgextra/i4/O1CN01ne9AcK1TuwidOmM8r_!!6000000002443-55-tps-16-16.svg';
const FOLDER_ICON_URL = 'https://img.alicdn.com/imgextra/i3/O1CN01j5XzwI1vhUK6pohx4_!!6000000006204-55-tps-16-16.svg';

const TOOL_ICONS: Record<string, string> = {
  read: '📄', // 读取数据
  write: '✏️', // 写入数据
  edit: '🔧', // 编辑数据
  exec: '⚡', // 执行命令
  process: '⚙️',
  web_search: '🔍', // 上网搜索
  web_fetch: '🌐', // 上网抓取
  browser: '🖥️', // 浏览
  memory_search: '🧠', // 查找记忆
  memory_get: '🧠', // 获取记忆
  message: '💬', // 发送消息
  tts: '🔊',
  cron: '⏰', // 定时任务
  gateway: '🔌', // 网关
  canvas: '🎨', // 画布
  nodes: '📡', // 节点
};

const MAX_RESULT_LEN = 2000;
const INITIAL_HISTORY_LIMIT = 30;
/** 流结束后刷新历史时是否启用 diff 追加，false 则直接用历史记录替换当前消息列表 */
const ENABLE_HISTORY_DIFF = true;
/** 向上滚动加载更多历史时是否启用 diff 向头部插入，false 则直接用历史记录替换当前消息列表 */
const ENABLE_PREPEND_DIFF = true;
const FULL_HISTORY_LIMIT = 1000; // 最大消息，超过会报错
const LOAD_MORE_THRESHOLD = 100; // 距顶部小于该值时触发加载更多历史

const USER_MSG_FILE_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
    <path
      fill="currentColor"
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
    />
  </svg>
);

const UserMessageBody: React.FC<{ content: string }> = ({ content }) => {
  const { text, attachments } = parseClawUserMessageWire(content);
  return (
    <div className={styles.messageContent}>
      {attachments.length > 0 ? (
        <div className={styles.userMessageAttachments}>
          {attachments.map((a) => (
            <a
              key={`${a.url}-${a.name}`}
              className={styles.userAttachmentPill}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.userAttachmentPillText} title={a.name}>
                {a.name}
              </span>
            </a>
          ))}
        </div>
      ) : null}
      {text ? <span className={styles.messageUserText}>{text}</span> : null}
    </div>
  );
};

function messageFingerprint(msg: TypeClawChatMessage): string {
  if (msg.role === 'tool') {
    if (msg.toolCalls && msg.toolCalls.length > 0) {
      return `tool:${msg.toolCalls.map((tc) => tc.toolCallId).sort().join(',')}`;
    }
    return `tool:${msg.content.trim().substring(0, 80)}`;
  }
  return `${msg.role}:${msg.content.trim().substring(0, 100)}`;
}

/**
 * final 后追加增量：找到 current 最后一条消息在 history 中的位置，
 * 把 history 里之后的新消息追加到 current 末尾。
 * 若找不到匹配（如新对话已开始），安全地返回 current 不变。
 */
function diffAndMerge(
  current: TypeClawChatMessage[],
  history: TypeClawChatMessage[],
): TypeClawChatMessage[] {
  if (current.length === 0 || history.length === 0) return current;
  const lastFp = messageFingerprint(current[current.length - 1]);
  let matchIdx = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (messageFingerprint(history[i]) === lastFp) {
      matchIdx = i;
      break;
    }
  }
  if (matchIdx === -1 || matchIdx >= history.length - 1) return current;
  return [...current, ...history.slice(matchIdx + 1)];
}

/**
 * 加载更多历史时向顶部插入：找到 current 第一条消息在 history 中的位置，
 * 把 history 里之前的旧消息插入到 current 头部。
 * 若找不到匹配或没有更旧的消息，安全返回 current 不变。
 */
function prependDiff(
  current: TypeClawChatMessage[],
  history: TypeClawChatMessage[],
): TypeClawChatMessage[] {
  if (current.length === 0) return history;
  if (history.length === 0) return current;
  const firstFp = messageFingerprint(current[0]);
  let matchIdx = -1;
  for (let i = 0; i < history.length; i++) {
    if (messageFingerprint(history[i]) === firstFp) {
      matchIdx = i;
      break;
    }
  }
  if (matchIdx <= 0) return current;
  return [...history.slice(0, matchIdx), ...current];
}

/** 合并展示连续工具调用：默认收起只显示「已调用工具」，展开显示工具列表，点击工具再展开详情 */
const ToolCallsGroup: React.FC<{ toolCalls: TypeClawToolCall[] }> = ({ toolCalls }) => {
  const [groupExpanded, setGroupExpanded] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const handleGroupToggle = () => {
    setGroupExpanded((v) => !v);
    if (groupExpanded) setExpandedToolId(null);
  };

  const handleToolClick = (toolCallId: string) => {
    setExpandedToolId((cur) => (cur === toolCallId ? null : toolCallId));
  };

  return (
    <div className={`${styles.toolCallsGroup} ${groupExpanded ? styles.toolCallsGroupExpanded : ''}`}>
      <div
        className={styles.toolCallsGroupHeader}
        onClick={handleGroupToggle}
      >
        <span className={styles.toolCallsGroupIcon} />
        <span className={styles.toolCallsGroupLabel}>已调用工具</span>
        <span className={styles.toolCallsGroupChevron} />
      </div>
      {groupExpanded && (
        <div className={styles.toolCallsGroupBody}>
          <ul className={styles.toolCallsList}>
            {toolCalls.map((tc) => {
              const icon = TOOL_ICONS[tc.name] || '🔧';
              const isDetailOpen = expandedToolId === tc.toolCallId;
              const argsStr = tc.args || '';
              const hasResult = tc.result !== undefined;
              const resultText = hasResult
                ? tc.result!.length > MAX_RESULT_LEN
                  ? `${tc.result!.substring(0, MAX_RESULT_LEN)}\n... (${tc.result!.length - MAX_RESULT_LEN} chars truncated)`
                  : tc.result!
                : '';

              return (
                <li key={tc.toolCallId} className={styles.toolCallsListItem}>
                  <div
                    className={`${styles.toolCallsItemRow} ${isDetailOpen ? styles.toolCallsItemRowActive : ''}`}
                    onClick={() => handleToolClick(tc.toolCallId)}
                  >
                    <span className={styles.toolCallsItemIcon}>{icon}</span>
                    <span className={styles.toolCallsItemName}>{tc.name}</span>
                    <span className={styles.toolCallsItemChevron} />
                  </div>
                  {isDetailOpen && (
                    <div className={styles.toolCallsItemDetail}>
                      {argsStr && (
                        <>
                          <div className={styles.toolCardLabel}>参数</div>
                          <pre className={styles.toolCardPre}>{argsStr}</pre>
                        </>
                      )}

                      {
                        argsStr && hasResult && (
                          <div className={styles.toolCallsItemSeparator} />
                        )
                      }

                      {hasResult && (
                        <>
                          <div className={`${styles.toolCardLabel} ${styles.toolCardResultLabel}`}>结果</div>
                          <pre className={styles.toolCardPre}>{resultText}</pre>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const ThinkingBlock: React.FC<{ thinking: string }> = ({ thinking }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.thinkingBlock} ${open ? styles.thinkingBlockOpen : ''}`}>
      <div
        className={styles.thinkingBlockHeader}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.thinkingBlockIcon}>💭</span>
        <span className={styles.thinkingBlockLabel}>思考过程</span>
        <span className={styles.thinkingBlockChevron} />
      </div>
      {open && (
        <div className={styles.thinkingBlockBody}>
          {thinking}
        </div>
      )}
    </div>
  );
};

const ChatInterface = observer(({ id }: TypeClawChatInterfaceProps) => {
  const [messages, setMessages] = useState<TypeClawChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [liveToolCalls, setLiveToolCalls] = useState<TypeClawToolCall[]>([]);
  const liveToolCallsRef = useRef<TypeClawToolCall[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showFileSystem, setShowFileSystem] = useState(false);

  // 部署进度遮罩：是否显示、接口是否已成功
  const [deployVisible, setDeployVisible] = useState(false);
  const [deployApiSuccess, setDeployApiSuccess] = useState(false);

  const handleDeployComplete = () => {
    setDeployVisible(false);
    setDeployApiSuccess(false);
  };
  /** 打开设置面板时默认定位的 tab，如 'model' 表示模型设置 */
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<TypeAlphaClawSettingsMenuId | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const composerRef = useRef<TypeClawChatComposerRef>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const configRef = useRef<TypeClawChatWsConfig>();

  const loadHistoryRef = useRef<(limit?: number) => Promise<TypeClawChatMessage[]>>(async () => []);
  /** 当前已请求的历史条数，每次向上滚动递增 INITIAL_HISTORY_LIMIT，上限 FULL_HISTORY_LIMIT */
  const currentLimitRef = useRef(INITIAL_HISTORY_LIMIT);
  const hasLoadedFullRef = useRef(false);
  const isLoadingMoreRef = useRef(false);

  const {
    connected,
    statusText,
    isRunning,
    connect,
    disconnect,
    sendMessage,
    stopGeneration,
    loadHistory,
  } = useClawChatWs({
    onStreamDelta: (text) => setStreamingContent(text),
    onStreamFinal: () => {
      const savedToolCalls = liveToolCallsRef.current;
      liveToolCallsRef.current = [];
      setLiveToolCalls([]);
      setStreamingContent((cur) => {
        const toAdd: TypeClawChatMessage[] = [];
        if (savedToolCalls.length > 0) {
          toAdd.push({
            id: `tool-${Date.now()}`,
            role: 'tool',
            content: '',
            toolCalls: savedToolCalls,
          });
        }
        if (cur.trim()) {
          toAdd.push({ id: `bot-${Date.now()}`, role: 'bot', content: cur });
        }
        if (toAdd.length > 0) {
          setMessages((p) => [...p, ...toAdd]);
        }
        return '';
      });
      // 加载历史做增量 diff，只追加新增部分，不替换已有内容
      // 用 currentLimitRef 保证 diff 覆盖当前已加载的所有消息
      loadHistoryRef.current(currentLimitRef.current).then((historyMessages) => {
        setMessages((current) => ENABLE_HISTORY_DIFF ? diffAndMerge(current, historyMessages) : historyMessages);
      }).catch(() => { });
    },
    onStreamAborted: () => {
      const savedToolCalls = liveToolCallsRef.current;
      liveToolCallsRef.current = [];
      setLiveToolCalls([]);
      setStreamingContent((cur) => {
        const toAdd: TypeClawChatMessage[] = [];
        if (savedToolCalls.length > 0) {
          toAdd.push({
            id: `tool-${Date.now()}`,
            role: 'tool',
            content: '',
            toolCalls: savedToolCalls,
          });
        }
        if (cur.trim()) {
          toAdd.push({ id: `bot-${Date.now()}`, role: 'bot', content: cur + '\n\n⏹ 已停止' });
        }
        if (toAdd.length > 0) {
          setMessages((p) => [...p, ...toAdd]);
        }
        return '';
      });
    },
    onStreamError: (errorMessage) => {
      const savedToolCalls = liveToolCallsRef.current;
      liveToolCallsRef.current = [];
      setLiveToolCalls([]);
      setStreamingContent((cur) => {
        const toAdd: TypeClawChatMessage[] = [];
        if (savedToolCalls.length > 0) {
          toAdd.push({
            id: `tool-${Date.now()}`,
            role: 'tool',
            content: '',
            toolCalls: savedToolCalls,
          });
        }
        if (cur.trim()) {
          toAdd.push({ id: `bot-${Date.now()}`, role: 'bot', content: cur });
        }
        toAdd.push({ id: `error-${Date.now()}`, role: 'error', content: errorMessage });
        setMessages((p) => [...p, ...toAdd]);
        return '';
      });
    },
    onError: (msg) => setSystemError(msg),
    onToolCallStart: (toolCallId, name, args) => {
      liveToolCallsRef.current = [
        ...liveToolCallsRef.current,
        { toolCallId, name, args },
      ];
      setLiveToolCalls([...liveToolCallsRef.current]);
    },
    onToolCallResult: (toolCallId, result) => {
      liveToolCallsRef.current = liveToolCallsRef.current.map((tc) =>
        tc.toolCallId === toolCallId ? { ...tc, result } : tc,
      );
      setLiveToolCalls([...liveToolCallsRef.current]);
    },
    onReconnected: (msgs) => {
      currentLimitRef.current = INITIAL_HISTORY_LIMIT;
      hasLoadedFullRef.current = false;
      setMessages(msgs);
    },
  });

  loadHistoryRef.current = loadHistory;

  const checkShowScrollBtn = useCallback(() => {
    const el = conversationRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!nearBottom);
  }, []);

  const loadMoreHistory = useCallback(() => {
    if (hasLoadedFullRef.current || isLoadingMoreRef.current || !connected) return;
    isLoadingMoreRef.current = true;
    const nextLimit = Math.min(currentLimitRef.current + INITIAL_HISTORY_LIMIT, FULL_HISTORY_LIMIT);
    const el = conversationRef.current;
    const prevScrollTop = el?.scrollTop ?? 0;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    loadHistoryRef.current(nextLimit)
      .then((historyMessages) => {
        flushSync(() => {
          setMessages((prev) => ENABLE_PREPEND_DIFF ? prependDiff(prev, historyMessages) : historyMessages);
        });
        if (el) {
          el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight);
        }
        currentLimitRef.current = nextLimit;
        if (nextLimit >= FULL_HISTORY_LIMIT) {
          hasLoadedFullRef.current = true;
        }
      })
      .catch(() => { })
      .finally(() => {
        isLoadingMoreRef.current = false;
      });
  }, [connected]);

  const loadMoreHistoryRef = useRef(loadMoreHistory);
  loadMoreHistoryRef.current = loadMoreHistory;

  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleConnect = useCallback(async (isInitConnect: boolean = false) => {
    if (isInitConnect) {
      setDeployVisible(true);
    }

    try {
      const res = await createClaw();
      configRef.current = {
        url: res.machineUrl,
        sessionKey: res.sessionKey,
        token: res.token,
      } as TypeClawChatWsConfig;

      setSystemError(null);
      // 首次部署有延迟，需要缓冲点时间再连接websocket提高成功率
      if (res.source === 'new') {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // 获取模型配置，如果没有配置模型或内容不完整，弹出设置弹窗并定位到模型设置
      // const modelRes = await getSettingModel();
      // const customModel = modelRes?.customModel;
      // const hasValidModel =
      //   customModel &&
      //   typeof customModel === 'object' &&
      //   (customModel.modelName ?? '').trim() !== '' &&
      //   (customModel.apiKey ?? '').trim() !== '' &&
      //   (customModel.baseUrl ?? '').trim() !== '';

      // if (!hasValidModel) {
      //   setSettingsDefaultTab('model');
      //   setSettingsOpen(true);
      // } else {
      const config = configRef.current as TypeClawChatWsConfig;
      const connectChain = connect(config);

      if (isInitConnect) {
        connectChain.onReply('chat.history', (data) => {
          // 可在此处理当前 WebSocket 实例收到的 chat.history 回复，如合并历史、同步状态等
          setDeployApiSuccess(true);
        });
      } else {
        handleDeployComplete();
      }
      // }

    } catch (error) {
      message.error(error.message || '部署失败，请稍后重试');

      handleDeployComplete();
    }
  }, [connect]);

  const handleUploadFiles = useCallback(async (files: File[]) => {
    const settled = await Promise.all(
      files.map(async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        try {
          const url = await uploadFile(fd);
          if (!url) {
            return { ok: false as const, file };
          }
          const item: TypeClawAttachmentItem = {
            id: crypto.randomUUID(),
            label: file.name,
            fileUrl: url,
          };
          return { ok: true as const, item };
        } catch {
          return { ok: false as const, file };
        }
      }),
    );
    const results: TypeClawAttachmentItem[] = [];
    settled.forEach((row) => {
      if (row.ok) {
        results.push(row.item);
      } else {
        message.error(`上传失败：${row.file.name}`);
      }
    });
    return results;
  }, []);

  const handleSend = useCallback(() => {
    const text = composerRef.current?.getSerialized().trim() ?? '';
    if (!text) return;
    const userMsg: TypeClawChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    composerRef.current?.clear();
    setSystemError(null);
    sendMessage(text);
  }, [sendMessage]);


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (!connected || !loadHistory) return;
    currentLimitRef.current = INITIAL_HISTORY_LIMIT;
    hasLoadedFullRef.current = false;
    loadHistory(INITIAL_HISTORY_LIMIT)
      .then((list) => setMessages(list))
      .catch((err) =>
        setSystemError('加载历史失败: ' + (err instanceof Error ? err.message : String(err))),
      );
  }, [connected, loadHistory]);

  useEffect(() => {
    const el = conversationRef.current;

    if (!el) return;
    // 统一的加载更多触发入口，确保 scroll 和 wheel 两个事件互斥，同一时刻只有一个能触发
    const tryLoadMore = () => {
      if (isLoadingMoreRef.current) return;
      loadMoreHistoryRef.current();
    };
    let prevScrollTop = el.scrollTop;
    const handleScroll = () => {
      checkShowScrollBtn();
      const isScrollingUp = el.scrollTop < prevScrollTop;
      prevScrollTop = el.scrollTop;
      if (isScrollingUp && el.scrollTop < LOAD_MORE_THRESHOLD) {
        tryLoadMore();
      }
    };
    // 内容不足以产生滚动条时，scroll 事件不会触发，改用 wheel 事件检测向上滚动趋势
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY >= 0) return;
      if (el.scrollTop < 2) {
        tryLoadMore();
      }
    };
    checkShowScrollBtn();
    el.addEventListener('scroll', handleScroll);
    el.addEventListener('wheel', handleWheel);
    const ro = new ResizeObserver(checkShowScrollBtn);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      ro.disconnect();
    };
  }, [conversationRef.current, checkShowScrollBtn, messages, streamingContent]);

  useEffect(() => {
    handleConnect(true);
    // ws 的清理由 useClawChatWs 内部的卸载 useEffect 负责
  }, []);

  const AssistantAvatar = () => {
    // 不显示系统对话logo
    return null;
    return (
      <div className={styles.messageAvatarWrapper}>
        <i className={styles.messageAvatar} />
      </div>
    );
  }

  return (
    <>
      <DeployProgressOverlay
        visible={deployVisible}
        apiSuccess={deployApiSuccess}
        onComplete={handleDeployComplete}
        stages={[
          { time: 5000, process: 30 },
          { time: 10000, process: 70 },
          { time: 10000, process: 90 },
          { time: 20000, process: 99 },
        ]}
      />

      <div className={`${styles.container} ${showFileSystem ? styles.openFileSystem : ''}`}>
        <div
          className={styles.clawChatContainer}
          data-connected={!connected}
        >
          <div className={styles.headerRow}>
            <h1 className={styles.title}>
              <img className={styles.titleLogo} src={alpha_claw_logo} alt="AlphaClaw" />
              <span>AlphaClaw</span>
              <Tooltip title="设置" trigger="hover">
                <View
                  className={styles.actionBtn}
                  onFirstAppear={() => {
                    aplus.record('/alphashop.clawchat.setting', "EXP");
                  }}
                  onClick={() => {
                    aplus.record('/alphashop.clawchat.setting', "CLK");
                    setSettingsDefaultTab(null);
                    setSettingsOpen(true);
                  }}
                >
                  <i className={styles.actionBtnIcon} style={{ maskImage: `url(${CONFIG_ICON_URL})` }} alt="设置" />
                </View>
              </Tooltip>
            </h1>

            <div className={styles.headerRight}>
              <Tooltip title="帮助" trigger="hover">
                <View
                  className={styles.actionBtn}
                  onFirstAppear={() => {
                    aplus.record('/alphashop.clawchat.guide', "EXP");
                  }}
                  onClick={() => {
                    aplus.record('/alphashop.clawchat.guide', "CLK");
                  }}
                >
                  <a
                    className={styles.actionBtn}
                    target="_blank"
                    href="https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFQqbNwxdJ3bzYmDO"
                    rel="noopener noreferrer"
                  >
                    <i className={styles.actionBtnIcon} style={{ maskImage: `url(${HELP_ICON_URL})` }} alt="帮助" />
                  </a>
                </View>
              </Tooltip>

              <Tooltip title="文件管理" trigger="hover">
                <View
                  className={styles.actionBtn}
                  onFirstAppear={() => {
                    aplus.record('/alphashop.clawchat.fileSystem', "EXP");
                  }}
                  onClick={() => {
                    aplus.record('/alphashop.clawchat.fileSystem', "CLK");
                    setShowFileSystem(true);
                  }}
                >
                  <i className={styles.actionBtnIcon} style={{ maskImage: `url(${FOLDER_ICON_URL})` }} alt="文件管理" />
                </View>
              </Tooltip>
            </div>
          </div>
          <div className={styles.conversationContainer}>

            <div
              className={styles.conversation}
              ref={conversationRef}
            >
              <div
                className={styles.conversationContent}
                role="log"
                aria-live="polite"
              >
                {messages.map((msg) =>
                  msg.role === 'user' ? (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${styles.messageIsUser}`}
                      data-message-role="user"
                    >
                      <UserMessageBody content={msg.content} />
                    </div>
                  ) : msg.role === 'error' ? (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${styles.messageIsAssistant}`}
                      data-message-role="error"
                    >
                      <AssistantAvatar />
                      <div className={styles.messageContent}>
                        <div className={styles.messageError}>{msg.content}</div>
                      </div>
                    </div>
                  ) : msg.role === 'tool' ? (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${styles.messageIsAssistant}`}
                      data-message-role="assistant"
                    >
                      <AssistantAvatar />
                      <div className={styles.messageContent}>
                        {msg.thinking && <ThinkingBlock thinking={msg.thinking} />}
                        {msg.content && (
                          <MarkdownContent className={`${styles.messageResponse}`} text={msg.content} />
                        )}
                        {(msg.toolCalls && msg.toolCalls.length > 0) && (
                          <ToolCallsGroup toolCalls={msg.toolCalls} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${styles.messageIsAssistant}`}
                      data-message-role="assistant"
                    >
                      <AssistantAvatar />
                      <div className={styles.messageContent}>
                        {msg.thinking && <ThinkingBlock thinking={msg.thinking} />}
                        {msg.content && (
                          <MarkdownContent className={`${styles.messageResponse}`} text={msg.content} />
                        )}
                      </div>
                    </div>
                  ),
                )}
                {liveToolCalls.length > 0 && (
                  <div
                    className={`${styles.message} ${styles.messageIsAssistant}`}
                    data-message-role="assistant"
                  >
                    <AssistantAvatar />
                    <div className={styles.messageContent}>
                      <ToolCallsGroup toolCalls={liveToolCalls} />
                    </div>
                  </div>
                )}
                {streamingContent ? (
                  <div
                    className={`${styles.message} ${styles.messageIsAssistant} ${styles.messageStreaming}`}
                    data-message-role="assistant"
                  >
                    <AssistantAvatar />
                    <div className={styles.messageContent}>
                      <MarkdownContent streaming className={`${styles.messageResponse}`} text={streamingContent} />
                    </div>
                  </div>
                ) : null}
                {isRunning && !streamingContent ? (
                  <div className={styles.typingIndicator}>
                    <AssistantAvatar />
                    <div className={styles.typingDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                ) : null}
                <div ref={messageEndRef} />
              </div>
            </div>

            <div className={styles.bottomBar}>
              {showScrollBtn && (
                <div
                  className={styles.conversationScrollBtn}
                  onClick={scrollToBottom}
                  aria-label="滚动到底部"
                />
              )}
              {/* 连接状态 */}
              {
                !connected && (
                  <div className={styles.connStatusBar} style={{ display: 'none' }}>
                    <span className={styles.connStatusText}>{statusText}</span>

                    <Button
                      onClick={() => {
                        setSettingsDefaultTab(null);
                        setSettingsOpen(true);
                      }}
                    >
                      打开设置
                    </Button>
                    <Button type="primary" danger onClick={() => handleConnect()}>点击重连</Button>
                  </div>
                )
              }

              {/* 对话输入框（contenteditable + 文件引用胶囊） */}
              <ClawChatComposer
                ref={composerRef}
                connected={connected}
                isRunning={isRunning}
                placeholder={connected ? '您可以向我继续提问...' : '请先连接 Gateway'}
                onSend={handleSend}
                onStop={stopGeneration}
                onUploadFiles={handleUploadFiles}
              />
            </div>
          </div>

          <Modal
            open={settingsOpen}
            onCancel={() => {
              setSettingsOpen(false);
              setSettingsDefaultTab(null);
            }}
            footer={null}
            width={800}
            styles={{ content: { padding: 0 } }}
            centered
            destroyOnHidden
            maskClosable={false}
          >
            <AlphaClawSettingsPanel
              sessionId={configRef.current?.sessionKey ?? ''}
              onClose={() => {
                setSettingsOpen(false);
                setSettingsDefaultTab(null);
              }}
              defaultActiveMenu={settingsDefaultTab ?? undefined}
            />
          </Modal>
        </div>

        <div className={styles.fileSystemContainer}>
          {showFileSystem && (
            <FileSystemPanel onClose={() => setShowFileSystem(false)} />
          )}
        </div>
      </div>
    </>
  );
});

export default ChatInterface;
