// 查询对话历史
import { materiaRequest as request } from "@/services/httpRequest";

export default async function queryHistoryList(params = {}, options = {}) {
  try {
    const res = await request(
      "/chatHistory/page",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          pageNumber: 1,
          pageSize: 200,
          ...params,
        }),
      },
      options
    );

    const { success, data: { data = [] } = {} } = res || {};
    if (success) {
      return data;
    }
    return false;
  } catch (e) {
    return false;
  }
}
