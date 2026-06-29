// 下载视频
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (params): Promise<string> {
  try {
    const res = await request(
      "/video/watermark/add",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          data: {
            ...params,
          }
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
