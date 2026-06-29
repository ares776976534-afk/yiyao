// 删除对话
import { materiaRequest as request } from "@/services/httpRequest";

export default  async function remove (sessionId: string): Promise<boolean> {
  try {
    const res = await request("/chatHistory/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        sessionId
      })
    });
    
    const { success, data } = res || {};
    if (success) {
      return data || false
    }
    return false
  } catch(e) {
    return false;
  }
}