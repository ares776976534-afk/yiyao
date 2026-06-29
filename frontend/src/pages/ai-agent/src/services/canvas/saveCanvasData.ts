// 保存画布数据
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (params): Promise<string> {
  try {
    const res = await request(
      "/canvas/save",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...params,
        }),
      },
      { silent: true }
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
