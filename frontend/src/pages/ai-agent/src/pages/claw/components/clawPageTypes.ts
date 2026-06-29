/** claw 页面相关类型 */

export interface TypeAlphaClawLandingProps {
  id?: string;
}

/** 单次工具调用 */
export interface TypeClawToolCall {
  toolCallId: string;
  name: string;
  /** JSON 字符串形式的参数 */
  args?: string;
  /** 工具执行结果文本 */
  result?: string;
}

/** claw 对话页消息项 */
export interface TypeClawChatMessage {
  id: string;
  /** user: 用户消息; bot: AI 文本回复; tool: 工具调用组（含工具卡片）; error: 流式错误消息 */
  role: 'user' | 'bot' | 'tool' | 'error';
  content: string;
  /** role === 'tool' 时使用 */
  toolCalls?: TypeClawToolCall[];
  /** assistant 消息中 type: 'thinking' 的思考内容 */
  thinking?: string;
}

export interface TypeClawChatInterfaceProps {
  id?: string;
  role?: 'page' | 'component';
}
