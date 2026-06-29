import { materiaRequest as request } from '@/services/httpRequest';

export interface TypeWechatLoginStatusData {
  status: string;
  qrCodeUrl?: string;
  message?: string;
  accountId?: string;
  errorMessage?: string;
}

export default async function getWechatLoginStatus(): Promise<TypeWechatLoginStatusData> {
  const res = await request('/alphaclaw/channel/wechat/login-status', {
    method: 'GET',
    credentials: 'include',
  });

  if (!res?.success) {
    throw new Error(res?.retMsg || res?.exception || '查询失败');
  }

  const data = (res?.data ?? res?.result) as TypeWechatLoginStatusData | undefined;
  if (!data?.status) {
    throw new Error('未返回状态');
  }

  return data;
}
