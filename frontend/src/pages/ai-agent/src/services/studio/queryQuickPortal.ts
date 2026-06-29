// 查询首页快捷入口
import { materiaRequest as request } from "@/services/httpRequest";

export default async function queryQuickPortal(params = {}, options = {}) {
  try {
    const res = await request(
      "/homepage/quickAction",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
      },
      options
    );

    const { success, result } = res || {};
    if (success) {
      return result || [];
    }
    return [];
  } catch (e) {
    return [];
  }
}
