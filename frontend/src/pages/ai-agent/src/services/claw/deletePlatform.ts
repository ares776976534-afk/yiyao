// 获取Claw设置中个性化配置
import { materiaRequest as request } from '@/services/httpRequest';

const mockResponse = {
  "success": true,
};

export default async function (skillKey: any): Promise<any> {
  // return mockResponse.success;

  try {
    const res = await request('/alphaclaw/platform/accounts/delete', {
      method: 'POST',
      body: JSON.stringify({ skillKey }),
      credentials: 'include',
    });

    return res?.result;
  } catch (e) {
    return '';
  }
}

