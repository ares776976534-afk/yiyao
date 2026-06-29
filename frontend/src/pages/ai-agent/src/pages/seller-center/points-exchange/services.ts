import request from '@/services/httpRequest';
import { chargeBaseUrl } from '@/utils/env';

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

// 兑换单位查询
export const queryExchangeUnit = async (params?: Record<string, any>) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${chargeBaseUrl}/exchange/queryExchangeUnit${queryString}`;

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

// 兑换花费积分计算
export const calculateExchangePoint = async (params?: Record<string, any>) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${chargeBaseUrl}/exchange/calculateExchangePoint${queryString}`;

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


// 兑换积分
export const exchangeTokenQuery = async (params?: Record<string, any>) => {
  try {
    const res = await request({
      url: `${chargeBaseUrl}/exchange/exchangeToken`,
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


// 查询兑换记录
export const queryExchangeRecord = async (params?: Record<string, any>) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${chargeBaseUrl}/exchange/queryExchangeRecord${queryString}`;

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
