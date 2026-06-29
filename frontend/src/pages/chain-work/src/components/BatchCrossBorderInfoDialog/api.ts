import diorRequest from '@/service/diorRequest';

// 查询是否展示跨境信息卡片
export const getNeedSetCrossInfoOfferCount = async (request) => {
  return diorRequest('CDT_4saDlI', 'getCrossBorderSettings', { request });
};

// 提交跨境信息
export const batchSetCrossBorderService = async (param) => {
  return diorRequest('CDT_86aI3P', 'batchSetCrossBorderService', { param });
};

// 提交跨境信息/跨境专供
export const batchSetCrossBorderInfo = async (request) => {
  return diorRequest('CDT_4saDlI', 'batchSetCrossBorderInfo', { request });
};
