import { fetchItemMtop } from '@alife/dior-fetch-data';
import Message from '@/components/UI/Message';
import mtopRequest from '@/service/mtop';

// 物流公司
export const getAllCpInfo = (params) => {
  return new Promise((resolve, reject) => {
    mtopRequest
      .request({
        api: 'mtop.alibaba.carriagecenter.logistic.getAllCpInfo',
        v: '1.0',
        type: 'POST',
        data: {
          ...params,
        },
      })
      .then(({ data: _data }) => {
        resolve(_data);
      })
      .catch((error) => {
        reject({
          success: false,
          errorMessage: error?.errMsg || '系统繁忙，请稍后再试。',
        });
      });
  });
};

// 发货请求
export const querySolution = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_15emMT', 'querySolution', {
      ...params,
    })
      .then((res) => {
        const { success, content } = res;
        const { msg } = content;
        if (success) {
          resolve(content);
        } else {
          Message._show({ content: msg || '数据异常', type: 'error' });
          throw new Error('数据异常');
        }
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};

// 发货（单个&合并）
export const createConsignOrder = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_15emMT', 'createConsignOrder', {
      ...params,
    })
      .then((res) => {
        const { success, content } = res;
        const { msg } = content;
        if (success) {
          resolve(content);
        } else {
          Message._show({ content: msg || '数据异常', type: 'error' });
          throw new Error('数据异常');
        }
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};

// 查询运单号
export const checkSupplierOfflineSend = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_15emMT', 'checkSupplierOfflineSend', {
      ...params,
    })
      .then((res) => {
        const { success, content } = res;
        const { msg } = content;
        if (success) {
          resolve(content);
        } else {
          Message._show({ content: msg || '数据异常', type: 'error' });
          throw new Error('数据异常');
        }
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};

// 查询默认地址
export const getSenderInfo = async (params) => {
  return new Promise((resolve) => {
    fetchItemMtop('CDT_15emMT', 'getSenderInfo', {
      ...params,
    })
      .then((res) => {
        const { success, content } = res;
        const { msg } = content;
        if (success) {
          resolve(content);
        } else {
          Message._show({ content: msg || '数据异常', type: 'error' });
          throw new Error('数据异常');
        }
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};
