/**
 * 订单分页查询
 */
import mtop from '../../mtop';

export default (data, requestParams) => {
  return mtop
    .request({
      api: 'mtop.com.alibaba.national.ae.queryAeOrderList',
      data,
      ...requestParams,
    })
    .then((res) => {
      return {
        success: true,
        data: res?.data?.data || {},
      };
    })
    .catch((res) => {
      return Promise.reject({
        success: false,
        errorCode: res?.data?.retCode,
        errorMessage: res?.data?.retMsg || (res.ret && res.ret[0]) || '服务异常',
      });
    });
};
