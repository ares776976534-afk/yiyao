export enum AppVersionType {
  CN = 'CN',
  GLOBAL = 'GLOBAL',
}

export const isPre = window.location.search.indexOf('pre=1') > -1 || window.location.host.indexOf('pre-') > -1 || window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('test') > -1;
export const isProd = !isPre;

export const baseUrl = isPre ? 'https://pre-www.alphashop.cn' : 'https://www.alphashop.cn';

export const appVersionType = window.pageData?.appVersionType || 'CN';

export const isGlobal = appVersionType === AppVersionType.GLOBAL;

export const enableMultipleLanguages = true;

export const isMobile = !!navigator.userAgent.match(
  /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
);
export const serviceBaseUrl1688 = isPre ? 'https://pre-global-ai-agent.1688.com' : 'https://global-ai-agent.1688.com';
// 本项目的api环境跟着域名走
export const serviceBaseUrl = baseUrl;

// 能力平台接口地址
export const chargeBaseUrl = isPre ? 'https://pre-global-ai-charge.alphashop.cn' : 'https://global-ai-charge.alphashop.cn';

export const appBaseUrl = (() => {
  const url = isGlobal ? 'www.alphashop.ai' : 'www.alphashop.cn';
  return isPre ? `https://pre-${url}` : `https://${url}`;
})();

// export const qrcodeUrl = 'https://img.alicdn.com/imgextra/i1/O1CN01KLahSW1eBZDDnFhfN_!!6000000003833-2-tps-1728-1644.png';
export const qrcodeUrl = 'https://img.alicdn.com/imgextra/i1/O1CN01ORaNm11wlRLpykpwR_!!6000000006348-2-tps-230-235.png';
export const wxcodeUrl = 'https://img.alicdn.com/imgextra/i3/O1CN01aYAWs01z1aXzUXSUg_!!6000000006654-2-tps-396-396.png';

export const defaultUserImg = 'https://img.alicdn.com/imgextra/i1/O1CN01Ob2cl11r21yxGsN2c_!!6000000005572-0-tps-1206-1206.jpg';

export const selApiBaseUrl = isPre ? 'https://pre-selection.alphashop.cn' : 'https://selection.alphashop.cn';

export const inquiryApiBaseUrl = isPre ? 'https://pre-inquiry.alphashop.cn' : 'https://inquiry.alphashop.cn';

export const spApiBaseUrl = isPre ? 'https://pre-select-provider.alphashop.cn' : 'https://select-provider.alphashop.cn';

export const materialBaseAPIUrl = (() => {
  const u = isGlobal ? 'www.alphashop.ai' : 'create.alphashop.cn';
  return isPre ? `https://pre-${u}` : `https://${u}`;
})();

export const globalMemberAPIUrl = isPre ? 'https://pre-gateway.1688overseas.com' : 'https://gateway.1688overseas.com';

export const globalMemberAuthPageUrl = isPre ? 'https://pre-air.1688.com/kapp/1688-global-fe-ai/alphashop-common-app/authLinkCbu' : 'https://air.1688.com/kapp/1688-global-fe-ai/alphashop-common-app/authLinkCbu';