import { materiaRequest as request } from '@/services/httpRequest';

export interface TypeWechatConnectData {
  status?: string;
  /** 已绑定等场景可能为 null，此时以 message 为准 */
  qrcodeUrl?: string | null;
  message?: string;
  accountId?: string;
  errorMessage?: string | null;
}

export default async function connectWechatChannel(): Promise<TypeWechatConnectData> {
  const res = await request('/alphaclaw/channel/wechat/connect', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res?.success) {
    throw new Error(res?.retMsg || res?.exception || '连接失败');
  }

  const data = (res?.data ?? res?.result) as TypeWechatConnectData | undefined;
  if (!data) {
    throw new Error(res?.retMsg || res?.exception || '返回数据为空');
  }

  return data;
}
