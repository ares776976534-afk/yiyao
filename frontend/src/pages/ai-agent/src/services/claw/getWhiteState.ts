// 获取当前用户是否在Claw的白名单中
import { materiaRequest as request } from '@/services/httpRequest';

export default async function (): Promise<any> {
  try {
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // return 'todo';

    const res = await request('/alphaclaw/deploy/inWhiteList', {
      method: 'GET',
      credentials: 'include',
    });

    return res?.result?.applyStatus;
  } catch (e) {
    return '';
  }
}

