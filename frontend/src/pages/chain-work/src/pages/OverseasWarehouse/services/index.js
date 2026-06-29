import diorRequest from '@/service/diorRequest';

// 获取海外仓商品经营待办保证金
export const getOwBusinessBacklog = async () => {
  return diorRequest('CDT_8fafhM', 'getOwBusinessBacklog', {});
};

// 查询商家海外仓入驻资料
export const querySettledInfo = async () => {
  return diorRequest('CDT_8fafhM', 'querySettledInfo', {});
};

// 查询相关枚举
export const queryEnums = async () => {
  return diorRequest('CDT_8fafhM', 'queryEnums', {});
};

// 查询海外仓商品列表
export const pageOwOfferMember = async (params) => {
  return diorRequest('CDT_8fafhM', 'pageOwOfferMember', {
    request: {
      ...params,
    },
  });
};