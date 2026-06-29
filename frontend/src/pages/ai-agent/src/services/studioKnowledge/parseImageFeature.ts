// 解析图片特征
import { materiaRequest as request } from '@/services/httpRequest';

export default async function (
  data: any[] = [],
): Promise<any> {
  const res = await request('/resource/image/feature', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (res && res.result) {
    return res.result;
  }

  throw {
    success: res?.success || false,
    retCode: res?.retCode,
    message: res?.retMsg || '操作失败',
    result: res?.result || [],
    exception: res?.exception || null,
  };
}

