import request, { mtopRequest } from './request';
import { Message } from '@alifd/next';
import FileSaver from 'file-saver';

// 确认补货
export const replenishmentPlanOrderConfirm = (params = []) => {
  return new Promise((resolve) => {
    request('replenishmentPlanOrderConfirm', { params: { billInfo: params }, type: 'POST' })
      .then((res) => {
        if (res.success) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => resolve(false));
  });
};

/**
 * 提交预约
 * @param {Array} coIds 发货单号
 * @param {string} appointDate 预约时间
 * @returns
 */
export const reservationOrderSubmit = (params = {}) => {
  return new Promise((resolve) => {
    mtopRequest({
      api: 'mtop.alibaba.national.sc.ScCOOperate',
      data: {
        params: JSON.stringify({
          param: params,
        }),
      },
      type: 'POST',
    })
      .then((res) => {
        resolve(res?.data?.data);
      })
      .catch((err) => resolve(err?.data?.data));
  });
};

/**
 * 确认发货
 * @param {Array} params 发货单号
 * @returns
 */
export const consignmentSubmit = (params = []) => {
  return new Promise((resolve) => {
    request('consignmentSubmit', { params: { billInfo: params }, type: 'POST' })
      .then((res) => {
        if (res.success) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => resolve(false));
  });
};

/**
 * 打印箱唛/商品标签
 * @param {Array} params 发货单号
 * @returns
 */
export const printBoxMarkService = (params = {}) => {
  Message.loading('请稍等...');
  return new Promise((resolve) => {
    request('printBoxMarkService', { params })
      .then((res) => {
        if (res.success) {
          resolve(res.model);
          Message.hide();
        } else {
          Message.error(res.msg);
          resolve(false);
        }
      })
      .catch(() => {
        Message.hide();
        resolve(false);
      });
  });
};

/**
 * 获取钉钉联系人
 * @returns string
 */
export const getDingTalkId = () => {
  return new Promise((resolve) => {
    mtopRequest({
      api: 'mtop.alibaba.national.ae.CrmOppEngineService',
      data: { productType: 1118 },
    })
      .then((res) => {
        resolve(res?.data?.result);
      })
      .catch(() => resolve(null));
  });
};

// 签署协议
export const signAgreement = (id) => {
  return new Promise((resolve) => {
    mtopRequest({
      api: 'mtop.cbu.pft.merchant.quit.signUserAgreement',
      data: { signTag: id },
    })
      .then((res) => {
        resolve(res);
      })
      .catch(() => resolve(null));
  });
};

// 签署优选协议
export const signShopInfoAgreement = (tagId) => {
  return new Promise((resolve) => {
    mtopRequest({
      api: 'mtop.com.alibaba.cbu.kj.merchant.user.submitShopEnrollInfo',
      data: { tagId },
    })
      .then((res) => {
        resolve(res);
      })
      .catch(() => resolve(null));
  });
};

// 导出发货信息
export const exportWareHouse = (billInfo) => {
  return new Promise((resolve) => {
    request('downloadWareHouse', { params: { billInfo }, type: 'POST' })
      .then((res) => {
        resolve(res?.model || null);
      })
      .catch(() => resolve(null));
  });
};

// 导出发货信息触发下载
export const exportWareHouseByDownload = (billInfos) => {
  return new Promise((resolve) => {
    Message.loading('导出中，请稍等...');
    exportWareHouse(billInfos)
      .then((res) => {
        if (res) {
          FileSaver.saveAs(res);
        }
      })
      .finally(() => {
        Message.hide();
      });
  });
};

export const signKjPayAgreement = () => {
  return new Promise((resolve) => {
    mtopRequest({
      api: 'mtop.cbu.pft.merchant.quit.signKjPayAgreement',
      data: {},
    }).then((res) => {
      resolve(res);
    });
  });
};
