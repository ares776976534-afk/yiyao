// 获取分享数据
import { materiaRequest as request } from "@/services/httpRequest";

interface TypeParams {
  shareCode: string;
}

export default async function (params: TypeParams): Promise<string> {
  try {
    const res = await request(
      "/shareRecord/readByCode",
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
