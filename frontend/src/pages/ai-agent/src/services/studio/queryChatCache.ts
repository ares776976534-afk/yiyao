// 首页对话缓存用户输入跳转到对话页取出来继续对话
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (queryId: string): Promise<string> {
  try {
    const res = await request(
      "/chatCache/get",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: queryId,
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
