import Mtop from '@/service/mtop';
import { Message } from '@alifd/next'; // mtop的主域
import configCenter from '@alife/channel-uni-config-center';
import { fetchItemMtop } from '@alife/dior-fetch-data';
import diorRequest from '@/service/diorRequest';

// 设置疲劳度
export const setAp = (key, ex) => {
  const args = {
    key,
  };
  if (ex) args.ex = ex;
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.aliyun.fc.api.loginOptional',
      v: '1.0',
      ecode: 0,
      data: {
        fcGroup: 'channel-ap',
        fcName: 'raFeStorageService-setAP',
        fcArgs: JSON.stringify(args),
      },
    })
      .then((res) => {
        if (res && res.data && res.data.model && res.data.model.success) {
          resolve(true);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
// 获取疲劳度
export const getAp = (key) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.aliyun.fc.api.loginOptional',
      v: '1.0',
      ecode: 0,
      data: {
        fcGroup: 'channel-ap',
        fcName: 'raFeStorageService-getAP',
        fcArgs: JSON.stringify({
          key,
        }),
      },
    })
      .then((res) => {
        if (res && res.data && res.data.model && res.data.model.success) {
          resolve(res.data.model.data === 'true');
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
// 数字供应链入驻接口
export const CommissionZwfxServiceSign = (params) => {
  return Mtop.request({
    api: 'mtop.cbu.commission.service.CommissionZwfxService.sign', // 必须
    v: '1.0',
    data: {
      ...params,
    }, // 必须（注意1）
  }).then((res) => {
    return res;
  });
};
// 全球严选批量加入接口
export const batchItemEnroll = (params) => {
  return Mtop.request({
    api: 'mtop.com.alibaba.cbu.kj.merchant.user.batchItemEnroll', // 必须
    v: '1.0',
    data: {
      ...params,
    }, // 必须（注意1）
  }).then((res) => {
    return res;
  });
};
// 货通全球商机查询接口
export const queryOppGroup = (params) => {
  return Mtop.request({
    api: 'mtop.com.alibaba.cbu.kj.merchant.user.jx.queryOppGroup', // 必须
    v: '1.0',
    data: {
      ...params,
    }, // 必须（注意1）
  }).then((res) => {
    return res;
  });
};
// 全球严选单品加入接口
export const joinOfferQqjx = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.jx.joinOffer', // 必须
      v: '1.0',
      data: {
        ...params,
      }, // 必须（注意1）
    })
      .then((res) => {
        if (res && res.data && res.data.bizSuccess) {
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject({
          success: false,
          errorCode: err?.data?.retCode,
          errorMessage: err?.data?.retMsg || (err.ret && err.ret[0]) || '服务异常',
        });
      });
  });
};
// 全球严选单品拒绝接口
export const refuseOfferQqjx = (params) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.item.jx.makeTag', // 必须
      v: '1.0',
      data: {
        ...params,
      }, // 必须（注意1）
    })
      .then((res) => {
        if (String(res?.data?.bizSuccess) === 'true' && String(res?.data?.data) === 'true') {
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject({
          success: false,
          errorCode: err?.data?.retCode,
          errorMessage: err?.data?.retMsg || (err.ret && err.ret[0]) || '服务异常',
        });
      });
  });
};
// 商品退出全球严选
export const quitOfferQqjx = (params) => {
  return Mtop.request({
    api: 'mtop.com.alibaba.cbu.kj.merchant.user.jx.quitOffer', // 必须
    v: '1.0',
    data: {
      ...params,
    }, // 必须（注意1）
  }).then((res) => {
    return res;
  });
};
// 商品退出货通全球
export const quitOfferHtqq = (params) => {
  return Mtop.request({
    api: 'mtop.com.alibaba.cbu.kj.merchant.user.quitOffer', // 必须
    v: '1.0',
    data: {
      ...params,
    }, // 必须（注意1）
  }).then((res) => {
    return res;
  });
};
// 可提报商品查询
export const getQueryItemList = (params) => {
  return Mtop.request({
    api: 'mtop.alibaba.itemEnroll.PftOfferEnroll.queryItemList', // 必须
    data: {
      ...params,
    }, // 必须（注意1）
  }).then((res) => {
    return res;
  });
};
/**
 *  查询商家类型
 */
export const querySellerType = (tagId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.querySellerType',
      v: '1.0',
      data: {
        tagId,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

/**
 *  提交商家入驻信息
 */
export const submitShopEnrollInfo = (tagId) => {
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.submitShopEnrollInfo',
      v: '1.0',
      data: {
        tagId,
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

/**
 *  查询商品列表
 */
export const queryOfferModelList = ({ ...parame }) => {
  const { pageNo, itemId, filterParams, pageSize, oppTag } = parame;
  const filterTagQuery = {
    777570: '575939',
    901094: '415426,575939',
    901095: '415426,575939',
    0: '',
  };
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.queryOfferModelList',
      v: '1.0',
      data: {
        pageNum: pageNo || 1,
        pageSize: pageSize || 10,
        ruleId: filterParams?.selectValue || 901094,
        filterTag: filterParams?.selectValue === '0' ? '' : filterTagQuery[filterParams?.selectValue] || '415426,575939',
        itemId: filterParams?.itemId,
        oppTag: oppTag || '',
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

export const getTextList = ({ ...parame }) => {
  const { pageNo, itemId } = parame;
  return new Promise((resolve, reject) => {
    configCenter
      .getByResourceId(32647082)
      .then((res) => {
        if (res && res.data) {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// 批量设置禁售国家/地区
export const batchSetProhibitedArea = (parame) => {
  return fetchItemMtop('CDT_86aI3P', 'batchSetProhibitedArea', parame);
};

// AE协议标查询使用dior
export const querySignAgreement = (parame) => {
  return fetchItemMtop('CDT_a1fXbk', 'querySignAgreement', parame);
};

// Choice 协议升级
export const choiceUpgrade = (parame) => {
  return fetchItemMtop('CDT_a42Gl0', 'choiceUpgrade', parame);
};

// 获取 choice 基础信息
export const getChoiceBaseInfo = (parame) => {
  return fetchItemMtop('CDT_a42Gl0', 'getChoiceBaseInfo', parame);
};

/**
 *  查询商品列表新
 */
export const queryOfferList = ({ ...parame }) => {
  const { pageNo, itemId, filterParams, pageSize, oppTag } = parame;
  const filterTagQuery = {
    777570: '575939',
    901094: '415426,575939',
    901095: '415426,575939',
    0: '',
  };
  return new Promise((resolve, reject) => {
    Mtop.request({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.queryOfferModelList',
      v: '1.0',
      data: {
        pageNum: pageNo || 1,
        pageSize: pageSize || 10,
        ruleId: filterParams?.selectValue || 0,
        filterTag: filterParams?.selectValue === '0' ? '' : filterTagQuery[filterParams?.selectValue] || '',
        itemId: filterParams?.itemId,
        oppTag: oppTag || '',
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        Message.error(error.ret[0].split('::')[1]);
      });
  });
};

// 查询商家是否入驻大严选帮卖接口
export const queryCommissionAgreement = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'queryCommissionAgreement', parame);
};

// 商家入驻大严选帮卖接口
export const signAgreement = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'signAgreement', parame);
};

// 开启自动邀约
export const openAutoInvite = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'openAutoInvite', parame);
};

// 关闭自动邀约
export const closeAutoInvite = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'closeAutoInvite', parame);
};

// 查询商家是否开启自动邀约
export const queryIsAutoInvite = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'queryIsAutoInvite', parame);
};

// 全球严选商品数据面板（整体看板- UED 中左侧的）
export const getGlobalYxDataBoard = (parame) => {
  return fetchItemMtop('CDT_2kfNOY', 'getGlobalYxDataBoard', parame).then((res) => res?.content);
};

// 全球严选商家数据面板（商家看板-UED 中右侧的）
export const getGlobalYxMemberRightDashboard = (parame) => {
  return fetchItemMtop('CDT_2kfNOY', 'getGlobalYxMemberRightDashboard', parame).then((res) => res?.content);
};

// 全店自动加入全球严选查询是否开启
export const queryIsShopAutoJoin = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'queryIsShopAutoJoin', parame);
};

// 全店自动加入全球严选开启
export const openShopAutoJoin = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'openShopAutoJoin', parame);
};

// 全店自动加入全球严选关闭
export const closeShopAutoJoin = (parame) => {
  return fetchItemMtop('CDT_bpbyRf', 'closeShopAutoJoin', parame);
};

// 申请上架（批量上架）
export const signUp = async (request) => {
  return diorRequest('CDT_77g0mc', 'signUp', request);
};

export const getOppFilterOption = async (request) => {
  return diorRequest('CDT_78ahyt', 'getOppFilterOption', { request });
};

// 件重尺模块
// 这个 mtop 内调的是dior：mtop.alibaba.cbu.WorkDiorDataReaderService.getValuesFromGateway
export const getBusinessBacklog = (parame) => {
  return fetchItemMtop('CDT_7dfURj', 'getBusinessBacklog', parame).then((res) => res?.content);
};
