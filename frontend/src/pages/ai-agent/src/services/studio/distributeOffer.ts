// 铺货，国际版铺货也指向国内服务器
import request from "@/services/httpRequest";
import { isPre } from '@/utils/env';

export default async function (params): Promise<string> {
  const res = await request(
    `${isPre ? 'https://pre-create.alphashop.cn' : 'https://create.alphashop.cn'}/distribution/one-click-distribution`,
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
  return res;
}
