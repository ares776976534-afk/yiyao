// 更新对话标题
import { materiaRequest as request } from "@/services/httpRequest";

interface TypeParmas {
  title: string;
  sessionId: string;
  userId?: number | string;
}
export default async function updateTitle(
  params: TypeParmas
): Promise<boolean> {
  try {
    const res = await request(
      "/chatHistory/update",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          ...params,
        }),
      }
    );
    
    const { success, result } = res || {};

    if (success) {
      return result || true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}
