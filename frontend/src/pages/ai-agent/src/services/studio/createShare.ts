// 创建分享记录
import { materiaRequest as request } from "@/services/httpRequest";

interface TypeParams {
  sessionId: string;
  shareMode: 'CONTINUE' | 'LAST_TASK';
}

export default async function (params: TypeParams): Promise<string> {
  try {
    const res = await request(
      "/shareRecord/create",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...params,
        }),
      }
    );
    const { success, result } = res || {};

    if (success) {
      return result;
    } else {
      return "";
    }
  } catch (e) {
    return "";
  }
}
