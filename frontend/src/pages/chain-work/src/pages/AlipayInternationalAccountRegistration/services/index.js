import diorRequest from '@/service/diorRequest';

// 获取注册所需枚举
export const queryEnums = () => {
  return diorRequest('CDT_08a0NN', 'queryEnums', {});
};

// 使用 auth_code 换取 alipayUserId
export const queryAlipayUserIdByAuthCode = (request) => {
  return diorRequest('CDT_08a0NN', 'queryAlipayUserIdByAuthCode', request);
};

// 营业执照 OCR 识别
export const recognizeBusinessLicense = (request) => {
  return diorRequest('CDT_08a0NN', 'recognizeBusinessLicense', request);
};

// 文字翻译接口
export const translateText = (request) => {
  return diorRequest('CDT_08a0NN', 'translateText', request);
};

// 身份证 OCR 识别
export const recognizeIdCard = (request) => {
  return diorRequest('CDT_08a0NN', 'recognizeIdCard', request);
};

// 提交支付宝国际账号 CDD 信息
export const submitSettledCDDInfo = (request) => {
  return diorRequest('CDT_08a0NN', 'submitSettledCDDInfo', request);
};

// 查询商家注册提交的信息
export const querySettledInfo = (request) => {
  return diorRequest('CDT_08a0NN', 'querySettledInfo', request);
};

// 判断营业执照是不是最新
export const judgeBusinessLicenseLatest = (request) => {
  return diorRequest('CDT_08a0NN', 'judgeBusinessLicenseLatest', request);
};
