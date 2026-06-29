import diorRequest from '@/service/diorRequest';

// 查询商家海外仓入驻资料
export const querySettledInfo = () => {
  return diorRequest('CDT_8fafhM', 'querySettledInfo', {});
};

// 查询商家海外仓入驻资料
export const submitSettledInfo = (params) => {
  return diorRequest('CDT_8fafhM', 'submitSettledInfo', {
    request: { ...params },
  });
};