// 恢复会话接口 (Poll-Stream 模式) - v2 格式
import { materiaRequest as request } from "@/services/httpRequest";
export interface TypeResumeChatParams {
  sessionId: string;
  taskId?: string;
  resumePoint?: string;
  feedback: {
    chooseStatus: "accept" | "refuse";
    chooseIndex?: number | number[];
  };
  sessionMeta?: {
    version: string;
  };
}

export interface TypeResumeChatResult {
  sessionId: string;
  taskId: string;
  title?: string;
  sessionImage?: string;
  startEventId: number;
}

export default async function resumeChat(
  params: TypeResumeChatParams,
): Promise<{
  success: boolean;
  data: TypeResumeChatResult | null;
  retCode?: string;
  retMsg?: string;
}> {
  try {
    const res = await request("/alpha-shop/agent/resume/v2", {
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
    console.error("【resumeChat】接口异常:", e);
    return { success: false, data: null };
  }
}
