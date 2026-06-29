// 创建对话缓存
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (params): Promise<string> {
  const _params = typeof params === 'string' ? {
    query: params,
  } : params;

  const res = await request(
    "/chatCache/create",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ..._params,
      }),
    }
  );
  const { success, result } = res || {};

  if (success) {
    return result;
  } else {
    return "";
  }
}
