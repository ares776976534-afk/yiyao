import diorRequest from '@/service/diorRequest';
import Message from '@/components/UI/Message';
import Mtop from '@/service/mtop';

// 查询相关枚举信息
export const queryOfferEnums = (request) => {
  return new Promise((resolve) => {
    diorRequest('CDT_4saDlI', 'queryOfferEnums', request).then((res) => {
      const { success, model, msg } = res;
      if (success) {
        resolve(model);
      } else {
        resolve([]);
        Message._show({ content: msg || '查询失败', type: 'error' });
      }
    }).catch((err) => {
      resolve([]);
      Message._show({ content: err.message || '查询失败', type: 'error' });
    });
  });
};

// 分页查询商品信息
export const pageOffer = (request) => {
  return diorRequest('CDT_4saDlI', 'pageOffer', request);
};

// 商品加入货通全球
export const joinHtqq = (request) => {
  return diorRequest('CDT_4saDlI', 'joinHtqq', request);
};

// 查询分销商品数量
export const getOfferCount = (request) => {
  return diorRequest('CDT_4saDlI', 'getOfferCount', request);
};

// 数据概览
export const ranking = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'alibaba.cbu.global.ditribution.offer.ranking',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 查询海外分销GMV排名
export const gmvRanking = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'alibaba.cbu.global.ditribution.gmv.ranking',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 查询签署协议标
export const querystatus = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'alibaba.cbu.global.ditribution.price.agreement.querystatus',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 签署协议后打标
export const comfirm = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'alibaba.cbu.global.ditribution.price.agreement.comfirm',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.msg || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};