// 获取暗水印
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (params): Promise<string> {
  try {
    const res = await request(
      "/watermark/dark/get",
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
