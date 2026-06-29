// 查询首页showCase
import { materiaRequest as request } from "@/services/httpRequest";

export default async function queryHistoryList(params = {}, options = {}) {
  try {
    const res = await request(
      "/homepage/showCases",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          pageNumber: 1,
          pageSize: 20,
          ...params,
        }),
      },
      options
    );

    const { success, result: { data = [] } = {} } = res || {};
    if (success) {
      return data;
    }
    return [];
  } catch (e) {
    return [];
  }
}
