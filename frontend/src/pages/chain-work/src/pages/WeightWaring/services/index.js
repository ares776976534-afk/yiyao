import diorRequest from '@/service/diorRequest';

// 分页查询件重尺预警商品
export const pagePwsAlertItem = async (param) => {
  return diorRequest('CDT_5bfzQl', 'pagePwsAlertItem', param);
};

// 单个商品件重尺查询
export const queryItemPws = async (param) => {
  return diorRequest('CDT_5bfzQl', 'queryItemPws', param);
};

// 接受/忽略件重尺预警建议
export const operatePwsSuggest = async (param) => {
  return diorRequest('CDT_5bfzQl', 'operatePwsSuggest', param);
};
