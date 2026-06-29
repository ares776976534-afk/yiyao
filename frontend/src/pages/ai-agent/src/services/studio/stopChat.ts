// 终止对话
import { materiaRequest as request } from "@/services/httpRequest";

export default async function stopChat(sessionId: string): Promise<boolean> {
  try {
    const res = await request("/alpha-shop/agent/terminate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        sessionId,
      }),
    });

    const { success, result } = res || {};
    if (success) {
      return result || false;
    }
    return false;
  } catch (error) {
    throw error;
  }
}
