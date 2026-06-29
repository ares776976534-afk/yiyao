import diorRequest from '@/service/diorRequest';
import Message from '@/components/UI/Message';

// 查询供应商信息
export const querySupplierInfoService = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify(params),
      serviceName: 'querySupplierInfoService',
    })
      .then((res) => {
        const { success } = res;
        if (success) {
          resolve(res);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch((err) => Message._show({ content: err.errorMessage || '数据异常', type: 'error' }));
  });
};

// 编辑供应商信息
export const editSupplierInfoService = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify(params),
      serviceName: 'editSupplierInfoService',
    })
      .then((res) => {
        const { success } = res;
        if (success) {
          resolve(res);
        } else {
          throw new Error('数据异常');
        }
      })
      .catch((err) => Message._show({ content: err.errorMessage || '数据异常', type: 'error' }));
  });
};

// 类目接口
export const dataList = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_7kawoJ', 'dataList', params)
      .then((res) => {
        resolve(res);
      }).catch((err) => Message._show({ content: err.errorMessage || '数据异常', type: 'error' }));
  });
};
