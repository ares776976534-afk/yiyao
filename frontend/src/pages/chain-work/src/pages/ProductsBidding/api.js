import { Message } from '@alifd/next'; // mtop的主域
import { fetchItemMtop } from '@alife/dior-fetch-data';
import Mtop from '@/service/mtop';
import diorRequest from '@/service/diorRequest';
/**
 * 商机查询
 */
export const getBusinessList = async (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.queryOppList',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        const { data } = res;
        // 兼容处理价格 100 倍问题 @跳凯
        if (data?.data?.length) {
          data.data = data.data.map((item) => {
            if (item.goal_price) {
              item.goal_price = Math.floor(item.goal_price * 1);
            }
            return item;
          });
        }
        resolve(data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

/**
 * 提报查询
 */
export const getRecordsList = async (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.querySkuJingjiaRecords',
      v: '1.0',
      type: 'POST',
      data: {
        ...params,
      },
    })
      .then((res) => {
        const { data } = res;
        // 兼容处理价格 100 倍问题 @跳凯
        if (data?.data?.length) {
          data.data = data.data.map((item) => {
            try {
              const oppMsg = JSON.parse(item.oppMsg);
              if (oppMsg.goal_price) {
                oppMsg.goal_price = Math.floor(oppMsg.goal_price * 1);
              }
              item.oppMsg = JSON.stringify(oppMsg);
            } catch (e) {
              console.log(e);
            }

            return item;
          });
        }
        resolve(data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

/**
 * 新建提报
 */
export const submitOppSku = async (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.submitOppSkuJingjia',
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
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

/**
 * 修改价格
 */
export const modifyOppSku = async (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.modifyOppSkuJingjia',
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
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 商家协议查询接口
export const querySellerType = async (tagId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.querySellerType',
      v: '1.0',
      type: 'POST',
      data: {
        tagId,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
      });
  });
};

// 商家协议签署接口
export const submitShopEnrollInfo = async (tagId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.submitShopEnrollInfo',
      v: '1.0',
      type: 'POST',
      data: {
        tagId,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
      });
  });
};

// 协议签署接口
export const logisiticsAgreement = async () => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.fc.official.logisitics.signup',
      v: '1.0',
      type: 'POST',
      data: {
        productType: 'BASE',
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
      });
  });
};

// 查询AE竞价成功商品
export const getAeRelationMsg = async () => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.queryAeRelationMsg',
      v: '1.0',
      type: 'POST',
      data: {},
    })
      .then((res) => {
        resolve(res?.data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 查询地址
export const getSendAddress = async (offerId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.querySendAddress',
      v: '1.0',
      type: 'POST',
      data: { offerId },
    })
      .then((res) => {
        resolve(res?.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// 配置文案及banner
export const getJdata = (jdataId) => {
  return Mtop.request({
    api: 'mtop.ali.smartui.getcomponentdata',
    v: '1.0',
    type: 'POST',
    data: {
      componentParams: JSON.stringify([{ jdataId, isNewLogic: true }]),
      aliETag: '',
      isGray: false,
    },
  }).then((res) => {
    const data = JSON.parse((res?.data && res?.data[jdataId]) || '{}');
    return data;
  });
};

/**
 * 新建提报
 */
export const submitMultipleSku = async (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.submitMultipleSku',
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
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

/**
 * 修改价格
 */
export const modifyMultipleSku = async (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.jj.merchant.user.modifyMultipleSku',
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
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 查询地址
export const getSku = async (offerId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.item.getPftPrice',
      v: '1.0',
      type: 'POST',
      data: { offerId },
    })
      .then((res) => {
        resolve(res?.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// 商家协议查询接口
export const batchQuerySellerType = async (tagIds) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.batchQuerySellerType',
      v: '1.0',
      type: 'POST',
      data: {
        tagIds,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。');
      });
  });
};

// 制造商信息信息展示接口
export const queryCrossBorderComponentByItemId = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'queryCrossBorderComponentByItemId', params);
};

// 制造商更换选择保存
export const submitManufacturerBinding = async (params) => {
  return fetchItemMtop('CDT_86aI3P', 'submitManufacturerBinding', params);
};

// 速卖通获取其他 SKU 信息
export const queryOtherSku = (request) => {
  return diorRequest('CDT_8igXcf', 'queryOtherSku', request);
};
