/**
 * 查询箱唛和标签的可打印PDF链接
 */
import mtop from '../../mtop';

export default ({ type, orderId }, requestParams) => {
  return mtop
    .request({
      api: type === 'box' ? 'mtop.1688.MtopAeLogisticsService.getDownloadBoxMarkUrl' : 'mtop.1688.MtopAeLogisticsService.getDownloadOfferMarkUrl',
      data: { orderId },
      type: 'post',
      ...requestParams,
    })
    .then((res) => {
      const url = res?.data?.model;

      if (url) {
        return url;
      }

      return Promise.reject(res);
    })
    .catch((res) => {
      return Promise.reject({
        success: false,
        errorCode: res?.data?.retCode,
        errorMessage: res?.data?.retMsg || (res.ret && res.ret[0]) || '服务异常',
      });
    });
};
