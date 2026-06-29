/** claw/chat 模块下 WebSocket 协议与配置类型 */

import type { TypeClawChatMessage } from './clawPageTypes';

export const PROTOCOL_VERSION = 3;

export interface TypeClawChatWsConfig {
  url: string;
  token: string;
  sessionKey: string;
}

export interface TypeClawChatClientInfo {
  id: string;
  displayName: string;
  version: string;
  platform: string;
  mode: string;
}

/** WS 入站：event 帧 */
export interface TypeClawChatEventFrame {
  type: 'event';
  event: 'connect.challenge' | 'chat' | 'agent';
  payload?: Record<string, unknown>;
}

/** WS 入站：res 帧 */
export interface TypeClawChatResFrame {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { message?: string };
}

/** chat 事件 payload.state */
export type TypeClawChatEventState = 'delta' | 'final' | 'aborted' | 'error';

/** chat 事件 payload */
export interface TypeClawChatEventPayload {
  sessionKey?: string;
  state?: TypeClawChatEventState;
  message?: { content?: unknown };
  errorMessage?: string;
}

/** agent 事件 payload（仅用 assistant 文本流） */
export interface TypeClawChatAgentPayload {
  sessionKey?: string;
  stream?: 'assistant' | 'tool';
  data?: { text?: string };
}

export interface TypeClawChatWsCallbacks {
  onStreamDelta?: (text: string) => void;
  onStreamFinal?: () => void;
  onStreamAborted?: () => void;
  onError?: (message: string) => void;
  /** 流式错误：stopReason === 'error'，携带 errorMessage，需清空流状态并在对话中展示错误 */
  onStreamError?: (errorMessage: string) => void;
  /** 工具调用开始（streaming 阶段） */
  onToolCallStart?: (toolCallId: string, name: string, args: string) => void;
  /** 工具调用结果到达（streaming 阶段） */
  onToolCallResult?: (toolCallId: string, result: string) => void;
  /** 自动重连成功后触发，携带最新一批历史消息，可用于补齐断连期间丢失的内容 */
  onReconnected?: (messages: TypeClawChatMessage[]) => void;
}

export interface TypeClawChatWsOptions extends TypeClawChatWsCallbacks {
  /** 断线后是否自动重连，默认 true */
  autoConnect?: boolean;
  /** 自动重连间隔毫秒数，默认 5000 */
  autoConnectInterval?: number;
}

/** connect() 返回的链式对象，用于监听当前 WebSocket 实例的 RPC 回复 */
export interface TypeClawChatWsConnectChain {
  /** 监听指定 method 的 RPC 回复（如 'chat.history'），成功时 callback 收到 payload */
  onReply(method: string, callback: (data: unknown) => void): TypeClawChatWsConnectChain;
}
