// 发起会话接口 (Poll-Stream 模式)
import { materiaRequest as request } from "@/services/httpRequest";
export interface TypeStartChatParams {
  sessionId?: string;
  query?: string;
  attachments?: Array<{
    sourceUrl: string;
    mimeType?: string;
    width?: number;
    height?: number;
  }>;
  offerInfos?: Array<any>;
  pattern?: string;
  sessionMeta?: {
    version: string;
  };
}

export interface TypeStartChatResult {
  sessionId: string;
  taskId: string;
  title?: string;
  sessionImage?: string;
  startEventId: number;
}

export default async function startChat(params: TypeStartChatParams): Promise<{
  success: boolean;
  data: TypeStartChatResult | null;
  retCode?: string;
  retMsg?: string;
}> {
  try {
    const res = await request("/alpha-shop/agent/chat/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });

    const { success, result, retCode, retMsg } = res || {};

    if (success && result) {
      return { success: true, data: result, retCode, retMsg };
    }

    return { success: false, data: null, retCode, retMsg };
  } catch (e) {
    console.error("【startChat】接口异常:", e);
    return { success: false, data: null };
  }
}
