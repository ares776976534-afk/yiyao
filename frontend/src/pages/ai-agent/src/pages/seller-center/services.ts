import request from '@/services/httpRequest';
import { chargeBaseUrl, serviceBaseUrl } from '@/utils/env';

// 构建 URL 查询字符串
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, String(params[key]));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// 获取API密钥
export const getApiKey = async () => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/api-key/get`,
      method: 'GET',
    });
    return {
      success: res?.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 创建API密钥
export const createApiKey = async (params: any) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/api-key/create`,
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      success: res?.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 获取余额统计
export const getBalanceStatistics = async () => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/balance/queryBalanceStatistics`,
      method: 'POST',
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 获取用量列表
export const getBalanceCostList = async (params: any) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/balance/queryBalanceCostList`,
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 获取订单列表
export const getOrderList = async (params: any) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/buyerOrder/queryOrderList`,
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 删除API密钥
export const deleteApiKey = async (params: any) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/api-key/delete`,
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

export const postApiPay = async (params: any) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/buyerOrder/createOrder`,
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 获取API套餐和API服务列表
export const getApiPackageAndServiceList = async (params: any) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/package/queryCommonPackagesAndService`,
      method: 'GET',
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

// 获取权限套餐列表
export const getPermissionPackageList = async () => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/package/queryPermissionPackage`,
      method: 'GET',
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

export const postWaitingList = async (params: any) => {
  try {
    const res = await request({
      url: `${serviceBaseUrl}/user/invite/save`,
      method: 'POST',
      body: JSON.stringify(params),
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

export const queryWaitingListResult = async () => {
  try {
    const res = await request({
      url: `${serviceBaseUrl}/user/invite/query`,
      method: 'GET',
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
      retMsg: error.message,
      retCode: error.code,
    };
  }
};


/** *************************** 兑换额度 **************************** */
// 余额统计
export const getExchangeQuota = async (params: any) => {
  const queryString = buildQueryString(params);
  const url = `${chargeBaseUrl}/balance/queryTokenStatistics${queryString}`;

  try {
    const res = await request({
      url,
      method: 'GET',
    });
    return {
      success: res.success,
      data: res.result,
      retMsg: res.retMsg,
      retCode: res.retCode,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};