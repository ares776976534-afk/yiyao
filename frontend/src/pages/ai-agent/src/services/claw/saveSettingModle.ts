// 获取当前用户是否在Claw的白名单中
import { materiaRequest as request } from '@/services/httpRequest';

const mockResponse = {
  "success": true,
  "language": "zh_CN",
  "invokeTime": null,
  "costTime": null,
  "retCode": "S0000",
  "retMsg": null,
  "exception": null,
};

export default async function (data: any): Promise<any> {
  try {
    const res = await request('/alphaclaw/model/config', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.success) {
      throw new Error(res.retMsg || res.exception || '');
    }

    return true;
  } catch (e) {
    throw new Error(e?.message || '保存失败');
  }
}

