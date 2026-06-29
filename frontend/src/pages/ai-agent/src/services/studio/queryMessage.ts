// 会话消息查询接口 (Poll-Stream 模式轮询)
import { materiaRequest as request } from "@/services/httpRequest";

export interface TypeQueryMessageParams {
  sessionId: string;
  startEventId?: number;
  signal?: AbortSignal;
}

export interface TypeMessage {
  messageType?: string;
  type?: string;
  sessionId?: string;
  taskId?: string;
  content?: string;
  status?: string;
  eventId?: number;
  isCompleted?: boolean;
  // 其他字段与原消息结构保持一致
  [key: string]: any;
}

export interface TypeQueryMessageResult {
  sessionId: string;
  title: string;
  sessionImage: string;
  messages: TypeMessage[];
  latestTaskId: number;
  taskStatus: string;
  nextEventId: number;
  meta: any;
}

export default async function queryMessage(
  params: TypeQueryMessageParams,
): Promise<{
  success: boolean;
  data: TypeQueryMessageResult | null;
  retCode?: string;
  retMsg?: string;
}> {
  const { signal, ...rest } = params;

  try {
    const res = await request("/alpha-shop/agent/chat/queryMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(rest),
      signal,
    });

    const { success, result, retCode, retMsg } = res || {};

    if (success && result) {
      return { success: true, data: result, retCode, retMsg };
    }

    return { success: false, data: null, retCode, retMsg };
  } catch (e) {
    console.error("【queryMessage】接口异常:", e);
    return { success: false, data: null };
  }
}
