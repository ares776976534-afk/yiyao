import diorRequest from '@/service/diorRequest';
import Message from '@/components/UI/Message';

// jit 订单查询
export const queryFcOrder = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_15emMT', 'queryFcOrder', {
      pageNum: params?.pageNo,
      ...params,
    })
      .then((res) => {
        const { list, total, pageNum, pageSize } = res;
        const obj = Object.assign({}, {
          model: list,
          total: Number(total),
          pageSize,
          pageNo: pageNum,
        });
        resolve(obj);
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
    diorRequest('CDT_15emMT', 'createConsignOrder', {
      ...params,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};

// 揽收轨迹（物流详情）
export const queryTraceInfoByConsignOrderId = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_15emMT', 'queryTraceInfoByConsignOrderId', {
      ...params,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};

// 取消揽收单
export const cancelFPOrder = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_15emMT', 'cancelFPOrder', {
      ...params,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
        resolve([]);
      });
  });
};

// 查询是否有发货权限
export const queryPermission = async () => {
  return new Promise((resolve) => {
    diorRequest('CDT_15emMT', 'checkSubAccountPermission', {}, { cache: true })
      .then((res) => {
        resolve(res?.data === true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};
