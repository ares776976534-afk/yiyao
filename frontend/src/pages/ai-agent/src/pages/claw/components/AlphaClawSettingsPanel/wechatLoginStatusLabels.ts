/** 微信扫码登录轮询 status → 展示文案（不直接使用接口 message） */
const WECHAT_LOGIN_STATUS_LABEL: Record<string, string> = {
  polling: '等待绑定',
  scaned: '等待绑定',
  confirmed: '已绑定',
  expired: '二维码过期',
  error: '服务异常',
  timeout: '操作超时',
};

export function getWechatLoginStatusLabel(status: string): string {
  return WECHAT_LOGIN_STATUS_LABEL[status] ?? WECHAT_LOGIN_STATUS_LABEL.polling;
}
