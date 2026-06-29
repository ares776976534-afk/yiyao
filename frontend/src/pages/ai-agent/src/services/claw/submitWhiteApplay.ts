// 提交Claw的白名单申请
import { materiaRequest as request } from '@/services/httpRequest';

export default async function (data: any): Promise<any> {
  const res = await request('/user/invite/save', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.success) {
    const errorMap = {
      'DEPLOY_NUM_LIMIT': '申请数量已达上限'
    }
    throw new Error(errorMap[res.retCode] || res.retMsg || '');
  }

  if (res && res.result) {
    return res.result;
  }
}

