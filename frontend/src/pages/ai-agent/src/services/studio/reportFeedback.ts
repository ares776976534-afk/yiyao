// 对话流问题反馈 - 图片和视频生成结果不满意反馈
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (params): Promise<string> {
  try {
    const res = await request("/feedback/save", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        data: {
          feedback: params,
        },
      }),
    });
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
