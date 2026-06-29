import { useCallback, useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  TypeClawChatWsConfig,
  TypeClawChatEventPayload,
  TypeClawChatAgentPayload,
  TypeClawChatWsOptions,
  TypeClawChatWsConnectChain,
} from '../clawChatProtocolTypes';
import { SHOW_THINKING_IN_MESSAGE } from '../constants';
import type { TypeClawChatMessage, TypeClawToolCall } from '../clawPageTypes';
import { PROTOCOL_VERSION } from '../clawChatProtocolTypes';

/** 自动重连后拉取历史的条数（与组件侧 INITIAL_HISTORY_LIMIT 保持一致） */
const RECONNECT_HISTORY_LIMIT = 30;

const CLIENT_INFO = {
  id: 'openclaw-control-ui',
  displayName: 'Web Chat',
  version: '1.0.0',
  platform: typeof navigator !== 'undefined' ? navigator.platform : 'web',
  mode: 'webchat',
};


function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((c: { type?: string }) => c.type === 'text' || c.type === 'output_text')
      .map((c: { text?: string }) => c.text || '')
      .join('');
  }
  return '';
}

function stripUserEnvelope(text: string): string {
  let t = text
    .replace(
      /^Conversation info \(untrusted metadata\):\s*```json\s*\{[\s\S]*?\}\s*```\s*/m,
      '',
    )
    .replace(
      /^\[(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+GMT[+-]\d+\]\s*/m,
      '',
    );
  return t.trim();
}

interface TypeHistoryMessage {
  role?: string;
  content?: unknown;
  [key: string]: unknown;
}

/** 将工具结果值（可能是字符串/对象/数组）格式化为展示文本 */
function formatToolResult(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.text === 'string') return v.text;
    if (Array.isArray(v.content)) {
      return (v.content as Array<{ type?: string; text?: string }>)
        .filter((c) => c && c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text || '')
        .join('\n');
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * 计算一组"assistant toolUse + 后续 toolResult"的内容指纹。
 * 忽略所有 id 字段，只基于：assistant 文本、工具名、工具入参、工具返回文本。
 */
function computeToolGroupFingerprint(
  assistantMsg: TypeHistoryMessage,
  toolResultMsgs: TypeHistoryMessage[],
): string {
  const content = assistantMsg.content;
  const textPart = Array.isArray(content)
    ? content
        .filter((c: { type?: string }) => c.type === 'text' || c.type === 'output_text')
        .map((c: { text?: string }) => c.text || '')
        .join('')
    : extractText(content);

  const toolCallsPart = Array.isArray(content)
    ? content
        .filter((c: { type?: string }) => c.type === 'toolCall' || c.type === 'tool_use')
        .map((c: { name?: string; arguments?: unknown; input?: unknown }) => {
          const args = c.arguments ?? c.input;
          return `${c.name ?? ''}|${typeof args === 'string' ? args : JSON.stringify(args ?? {})}`;
        })
        .join(';;')
    : '';

  const toolResultsPart = toolResultMsgs
    .map((tr) => extractText(tr.content))
    .join('||');

  return `${textPart}::${toolCallsPart}::${toolResultsPart}`;
}

/**
 * 在原始消息数组中，把连续的重复"工具调用组"去掉。
 * 一组 = 一条 assistant(stopReason=toolUse) + 紧随其后的所有 toolResult/tool 消息。
 * 若下一组的入参和返回文本与当前组完全相同（忽略 id），则认为是重复，跳过。
 */
function deduplicateRawToolGroups(messages: TypeHistoryMessage[]): TypeHistoryMessage[] {
  const result: TypeHistoryMessage[] = [];
  let lastGroupFingerprint: string | null = null;
  let i = 0;

  while (i < messages.length) {
    const msg = messages[i];
    const role = msg.role || '';

    if (role === 'assistant' && msg.stopReason === 'toolUse') {
      // 收集紧随其后的所有 toolResult/tool 消息
      const toolResultMsgs: TypeHistoryMessage[] = [];
      let j = i + 1;
      while (j < messages.length && (messages[j].role === 'toolResult' || messages[j].role === 'tool')) {
        toolResultMsgs.push(messages[j]);
        j++;
      }

      const fingerprint = computeToolGroupFingerprint(msg, toolResultMsgs);
      if (fingerprint !== lastGroupFingerprint) {
        result.push(msg, ...toolResultMsgs);
        lastGroupFingerprint = fingerprint;
      }
      i = j;
    } else {
      // user 消息或 assistant 最终回复，重置指纹上下文
      if (role === 'user' || (role === 'assistant' && msg.stopReason !== 'toolUse')) {
        lastGroupFingerprint = null;
      }
      result.push(msg);
      i++;
    }
  }

  return result;
}

function historyToMessages(messages: TypeHistoryMessage[]): TypeClawChatMessage[] {
  const deduped = deduplicateRawToolGroups(messages);
  const ts = Date.now();

  // 第一遍：收集工具结果；从 assistant 收集 toolCall 的 args（供 toolResult 使用）
  const toolResults = new Map<string, string>();
  const toolCallArgs = new Map<string, { name: string; args: string }>();
  deduped.forEach((msg) => {
    const role = msg.role || '';
    if (role === 'toolResult' || role === 'tool') {
      const tid = (msg.tool_use_id as string) || (msg.toolCallId as string) || '';
      if (tid) {
        const text = extractText(msg.content);
        if (text) toolResults.set(tid, text);
      }
    }
    if (role === 'assistant') {
      const content = msg.content;
      if (Array.isArray(content)) {
        content
          .filter((c: { type?: string }) => c.type === 'toolCall' || c.type === 'tool_use')
          .forEach((c: { id?: string; name?: string; arguments?: unknown; input?: unknown }) => {
            const id = c.id || '';
            if (id) {
              const argsRaw = c.arguments ?? c.input;
              toolCallArgs.set(id, {
                name: c.name || 'tool',
                args: typeof argsRaw === 'string' ? argsRaw : JSON.stringify(argsRaw || {}, null, 2),
              });
            }
          });
      }
    }
  });

  const result: TypeClawChatMessage[] = [];
  let pendingThinking = '';
  let pendingContent = '';

  deduped.forEach((msg, index) => {
    const role = msg.role || '';

    if (role === 'system') return;

    if (role === 'toolResult' || role === 'tool') {
      const tid = (msg.tool_use_id as string) || (msg.toolCallId as string) || '';
      const toolName = (msg.toolName as string) || 'tool';
      const resultText = extractText(msg.content);
      if (!tid) return;

      const meta = toolCallArgs.get(tid);
      const toolCall: TypeClawToolCall = {
        toolCallId: tid,
        name: meta?.name || toolName,
        args: meta?.args,
        result: resultText || toolResults.get(tid),
      };

      const lastMsg = result[result.length - 1];
      if (lastMsg?.role === 'tool') {
        lastMsg.toolCalls = [...(lastMsg.toolCalls || []), toolCall];
      } else {
        result.push({
          id: `history-tool-${index}-${ts}`,
          role: 'tool',
          content: pendingContent,
          toolCalls: [toolCall],
          thinking: pendingThinking || undefined,
        });
        pendingThinking = '';
        pendingContent = '';
      }
      return;
    }

    if (role === 'user') {
      pendingThinking = '';
      pendingContent = '';
      // 完整字符串透传至 TypeClawChatMessage.content；末尾 [attachment:name](url) 行由界面 parseClawUserMessageWire 解析为胶囊展示
      const text = stripUserEnvelope(extractText(msg.content));
      if (!text.trim()) return;
      result.push({
        id: `history-user-${index}-${ts}`,
        role: 'user',
        content: text,
      });
      return;
    }

    if (role === 'assistant') {
      if (msg.stopReason === 'error') {
        pendingThinking = '';
        pendingContent = '';
        const errorMessage = typeof msg.errorMessage === 'string' ? msg.errorMessage : '未知错误';
        result.push({
          id: `history-error-${index}-${ts}`,
          role: 'error',
          content: errorMessage,
        });
        return;
      }

      const content = msg.content;
      if (Array.isArray(content)) {
        const textStr = content
          .filter((c: { type?: string }) => c.type === 'text' || c.type === 'output_text')
          .map((c: { text?: string }) => c.text || '')
          .join('')
          .trim();

        const thinkingStr = SHOW_THINKING_IN_MESSAGE
          ? content
              .filter((c: { type?: string }) => c.type === 'thinking')
              .map((c: { thinking?: string }) => c.thinking || '')
              .filter(Boolean)
              .join('\n\n')
          : '';

        const toolCalls = content.filter(
          (c: { type?: string }) => c.type === 'toolCall' || c.type === 'tool_use',
        );

        if (toolCalls.length > 0) {
          pendingThinking = thinkingStr.trim();
          pendingContent = textStr;
        } else {
          pendingThinking = '';
          pendingContent = '';
          result.push({
            id: `history-bot-${index}-${ts}`,
            role: 'bot',
            content: textStr,
            thinking: thinkingStr.trim() || undefined,
          });
        }
      } else {
        pendingThinking = '';
        pendingContent = '';
        const text = extractText(content);
        if (!text.trim()) return;
        result.push({
          id: `history-bot-${index}-${ts}`,
          role: 'bot',
          content: text,
        });
      }
    }
  });
  return result;
}

export function useClawChatWs(options: TypeClawChatWsOptions = {}) {
  const { autoConnect = true, autoConnectInterval = 5000, ...callbacks } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<Map<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>>(new Map());
  const requestMethodRef = useRef<Map<string, string>>(new Map());
  const replyListenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());
  const reqIdRef = useRef(0);
  const sessionKeyRef = useRef('');
  const isRunningRef = useRef(false);
  const hasAgentEventsRef = useRef(false);
  const callbacksRef = useRef(callbacks);
  const lastConfigRef = useRef<TypeClawChatWsConfig | null>(null);
  const isManualDisconnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoConnectRef = useRef(autoConnect);
  const autoConnectIntervalRef = useRef(autoConnectInterval);
  /** 标记下一次连接成功是自动重连（非首次连接），用于触发 onReconnected */
  const pendingReconnectRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [statusText, setStatusText] = useState('未连接');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    autoConnectRef.current = autoConnect;
    autoConnectIntervalRef.current = autoConnectInterval;
  }, [autoConnect, autoConnectInterval]);

  const sendRpc = useCallback((method: string, params: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('not connected'));
    }
    const id = String(++reqIdRef.current);
    requestMethodRef.current.set(id, method);
    return new Promise<unknown>((resolve, reject) => {
      pendingRef.current.set(id, { resolve, reject });
      ws.send(JSON.stringify({ type: 'req', id, method, params }));
      setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          requestMethodRef.current.delete(id);
          reject(new Error('timeout'));
        }
      }, 60000);
    });
  }, []);

  window.ws = wsRef.current;

  const handleChatEvent = useCallback((payload: TypeClawChatEventPayload) => {
    if (!payload) {
      return;
    }

    const cb = callbacksRef.current;
    const state = payload.state;
    if (state === 'delta') {
      if (hasAgentEventsRef.current) return;
      const msg = payload.message;
      if (msg) {
        const text = extractText((msg as { content?: unknown }).content || msg);
        if (text) cb.onStreamDelta?.(text);
      }
    } else if (state === 'final') {
      hasAgentEventsRef.current = false;
      setIsRunning(false);
      isRunningRef.current = false;
      cb.onStreamFinal?.();
    } else if (state === 'aborted') {
      hasAgentEventsRef.current = false;
      setIsRunning(false);
      isRunningRef.current = false;
      cb.onStreamAborted?.();
    } else if (state === 'error') {
      setIsRunning(false);
      isRunningRef.current = false;
      cb.onStreamError?.(payload.errorMessage || '未知错误');
    }
  }, []);

  const handleAgentEvent = useCallback((payload: TypeClawChatAgentPayload) => {
    if (payload.stream === 'assistant') {
      const text = typeof payload.data?.text === 'string' ? payload.data.text : '';
      if (text) {
        hasAgentEventsRef.current = true;
        callbacksRef.current.onStreamDelta?.(text);
      }
      return;
    }

    if (payload.stream === 'tool') {
      hasAgentEventsRef.current = true;
      const data = (payload.data || {}) as Record<string, unknown>;
      const toolCallId = typeof data.toolCallId === 'string' ? data.toolCallId : '';
      if (!toolCallId) return;
      const name = typeof data.name === 'string' ? data.name : 'tool';
      const phase = typeof data.phase === 'string' ? data.phase : '';

      if (phase === 'start') {
        const argsRaw = data.args;
        const args = typeof argsRaw === 'string' ? argsRaw : JSON.stringify(argsRaw || {}, null, 2);
        callbacksRef.current.onToolCallStart?.(toolCallId, name, args);
      } else if (phase === 'result' || phase === 'update') {
        const rawResult = data.result !== undefined ? data.result : data.partialResult;
        const result = formatToolResult(rawResult);
        if (result) callbacksRef.current.onToolCallResult?.(toolCallId, result);
      }
    }
  }, []);

  /** 关闭指定 ws 实例并清理所有事件处理器，同时清空 pending RPC 队列 */
  const closeWs = useCallback((ws: WebSocket) => {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    // 拒绝所有因旧连接挂起的 RPC，防止其 resolve/reject 污染新连接的状态
    pendingRef.current.forEach(({ reject }) => reject(new Error('connection replaced')));
    pendingRef.current.clear();
    requestMethodRef.current.clear();
  }, []);

  const connect = useCallback(
    (config: TypeClawChatWsConfig): TypeClawChatWsConnectChain => {
      const chain: TypeClawChatWsConnectChain = {
        onReply(method: string, callback: (data: unknown) => void) {
          let set = replyListenersRef.current.get(method);
          if (!set) {
            set = new Set();
            replyListenersRef.current.set(method, set);
          }
          set.add(callback);
          return chain;
        },
      };

      // 清除待执行的重连 timer
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      // 关闭并清理旧连接（先置 null 再清理，防止 onclose 回调触发重连逻辑）
      if (wsRef.current) {
        const old = wsRef.current;
        wsRef.current = null;
        closeWs(old);
      }

      lastConfigRef.current = config;
      isManualDisconnectRef.current = false;
      const url = (config.url).trim();
      sessionKeyRef.current = config.sessionKey?.trim() || 'main';
      setStatusText('连接中...');
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        setStatusText('连接失败');
        setConnected(false);
        return chain;
      }
      wsRef.current = ws;
      ws.onopen = () => setStatusText('等待握手...');
      ws.onmessage = (event: MessageEvent) => {
        // 若此 ws 已被新连接替换，忽略所有消息（不触发任何状态更新）
        if (wsRef.current !== ws) return;
        let frame: { type?: string; event?: string; id?: string; ok?: boolean; payload?: any; error?: { message?: string } };
        try {
          frame = JSON.parse(event.data as string) as typeof frame;
        } catch {
          return;
        }
        if (frame.type === 'event') {
          if (frame.event === 'connect.challenge') {
            const token = (config.token || '').trim();
            sendRpc('connect', {
              minProtocol: PROTOCOL_VERSION,
              maxProtocol: PROTOCOL_VERSION,
              client: CLIENT_INFO,
              caps: ['tool-events', 'text-events'],
              auth: token ? { token } : undefined,
              role: 'operator',
              scopes: ['operator.read', 'operator.write', 'operator.admin', 'operator.approvals', 'operator.pairing'],
            })
              .then(() => {
                // 再次确认此 ws 仍是当前活跃连接
                if (wsRef.current !== ws) return;
                setConnected(true);
                setStatusText('已连接');
                sendRpc('sessions.patch', { key: sessionKeyRef.current, verboseLevel: 'on' }).catch(() => { });
                if (pendingReconnectRef.current) {
                  pendingReconnectRef.current = false;
                  const key = sessionKeyRef.current;
                  sendRpc('chat.history', { sessionKey: key, limit: RECONNECT_HISTORY_LIMIT })
                    .then((res) => {
                      const payload = res as { messages?: TypeHistoryMessage[] };
                      const filtered = (payload.messages || []).filter((m) => m.role !== 'system');
                      callbacksRef.current.onReconnected?.(historyToMessages(filtered));
                    })
                    .catch(() => { });
                }
              })
              .catch((err) => {
                if (wsRef.current !== ws) return;
                setStatusText('认证失败');
                setConnected(false);
                callbacksRef.current.onError?.('认证失败: ' + (err instanceof Error ? err.message : String(err)));
              });
            return;
          }
          if (frame.event === 'chat') {
            const p = frame.payload as TypeClawChatEventPayload | undefined;
            if (!p) return;
            const sk = typeof p.sessionKey === 'string' ? p.sessionKey.trim() : '';
            if (sk !== sessionKeyRef.current) return;
            handleChatEvent(p);
            return;
          }
          if (frame.event === 'agent') {
            const p = frame.payload as TypeClawChatAgentPayload | undefined;
            if (!p) return;
            const sk = typeof p.sessionKey === 'string' ? p.sessionKey.trim() : '';
            if (sk !== sessionKeyRef.current) return;
            handleAgentEvent(p);
            return;
          }
          return;
        }
        if (frame.type === 'res' && frame.id && pendingRef.current.has(frame.id)) {
          const p = pendingRef.current.get(frame.id)!;
          pendingRef.current.delete(frame.id);
          const method = requestMethodRef.current.get(frame.id);
          requestMethodRef.current.delete(frame.id);
          if (frame.ok === false) {
            p.reject(frame.error || { message: 'unknown error' });
          } else {
            p.resolve(frame.payload);
            if (method) {
              replyListenersRef.current.get(method)?.forEach((cb) => cb(frame.payload));
            }
          }
        }
      };
      ws.onclose = () => {
        // 若此 ws 已被新连接替换（wsRef.current !== ws），说明是主动切换连接导致的关闭，
        // 不修改任何状态，也不触发重连，避免污染新连接的状态
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        setConnected(false);
        setIsRunning(false);
        isRunningRef.current = false;

        if (!isManualDisconnectRef.current && autoConnectRef.current && lastConfigRef.current) {
          pendingReconnectRef.current = true;
          const interval = autoConnectIntervalRef.current;
          setStatusText('重连中...');
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            // 双重保障：若已有连接（外部抢先建立）或已手动断开，则放弃重连
            if (wsRef.current !== null || isManualDisconnectRef.current || !lastConfigRef.current) return;
            connect(lastConfigRef.current);
          }, interval);
        } else {
          setStatusText('已断开');
        }
      };
      ws.onerror = () => {
        if (wsRef.current !== ws) return;
        setStatusText('连接错误');
      };
      return chain;
    },
    [sendRpc, handleChatEvent, handleAgentEvent, closeWs],
  );

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    pendingReconnectRef.current = false;
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      const old = wsRef.current;
      wsRef.current = null;
      closeWs(old);
    }
    setConnected(false);
    setIsRunning(false);
    isRunningRef.current = false;
    setStatusText('未连接');
  }, [closeWs]);

  // 组件卸载时清理连接，防止幽灵 WebSocket 实例和卸载后触发 setState
  useEffect(() => {
    return () => {
      isManualDisconnectRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        const old = wsRef.current;
        wsRef.current = null;
        old.onopen = null;
        old.onmessage = null;
        old.onerror = null;
        old.onclose = null;
        if (old.readyState === WebSocket.OPEN || old.readyState === WebSocket.CONNECTING) {
          old.close();
        }
      }
    };
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        callbacksRef.current.onError?.('未连接，请先连接 Gateway');
        return;
      }
      const key = sessionKeyRef.current;
      isRunningRef.current = true;
      setIsRunning(true);
      const idempotencyKey = uuidv4();
      sendRpc('chat.send', {
        sessionKey: key,
        message: text,
        idempotencyKey,
      }).catch((err) => {
        callbacksRef.current.onError?.('发送失败: ' + (err instanceof Error ? err.message : String(err)));
        setIsRunning(false);
        isRunningRef.current = false;
      });
    },
    [sendRpc],
  );

  const stopGeneration = useCallback(() => {
    if (!wsRef.current) return;
    sendRpc('chat.abort', { sessionKey: sessionKeyRef.current }).catch(() => { });
    setIsRunning(false);
    isRunningRef.current = false;
  }, [sendRpc]);

  const loadHistory = useCallback((limit?: number): Promise<TypeClawChatMessage[]> => {
    const key = sessionKeyRef.current;
    return sendRpc('chat.history', { sessionKey: key, ...(limit !== undefined && { limit }) })
      .then((res) => {
        const payload = res as { messages?: TypeHistoryMessage[] };
        const list = payload.messages || [];
        const filtered = list.filter((m) => m.role !== 'system');
        return historyToMessages(filtered);
      });
  }, [sendRpc]);

  return {
    connected,
    statusText,
    isRunning,
    connect,
    disconnect,
    sendMessage,
    stopGeneration,
    loadHistory,
  };
}
