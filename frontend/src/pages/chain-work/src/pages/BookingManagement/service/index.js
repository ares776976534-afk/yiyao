import diorRequest from '@/service/diorRequest';
import { MessageError } from '@/utlis';

// 列表查询
export const queryPageAppointOrdersService = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_78f93P', 'process', {
      params: JSON.stringify(params),
      serviceName: 'queryPageAppointOrdersService',
    })
      .then((res) => {
        const { success } = res;
        if (success) {
          const { list, total } = res?.model;
          const data = Object.assign({}, { model: list, total: Number(total) });
          resolve(data);
        } else {
          MessageError(res?.msg || '数据异常');
          throw new Error('数据异常');
        }
      })
      .catch(() => resolve(Object.assign({}, { model: [], total: 0 })));
  });
};

// 预约单类型查询
export const queryAppointOrderTypeService = async (params) => {
  return diorRequest('CDT_78f93P', 'process', {
    params: JSON.stringify(params),
    serviceName: 'queryAppointOrderTypeService',
  });
};

// 日志查询
export const queryAppointOrderLogService = async (params) => {
  return new Promise((resolve) => {
    diorRequest('CDT_78f93P', 'process', {
      params,
      serviceName: 'queryAppointOrderLogService',
    }).then((res) => {
      const { success } = res;
      if (success) {
        const data = Object.assign({}, { model: res?.model, total: 0 });
        resolve(data);
      } else {
        MessageError(res?.msg || '数据异常');
        throw new Error('数据异常');
      }
    })
      .catch(() => resolve(Object.assign({}, { model: [], total: 0 })));
  });
};

// 导出
export const exportAppointOrders = async (params) => {
  return diorRequest('CDT_78f93P', 'process', {
    params: JSON.stringify(params),
    serviceName: 'appointOrderReportService',
  });
};

// 取消预约单接口
export const cancelAppointOrderService = async (params) => {
  return diorRequest('CDT_78f93P', 'process', {
    params: JSON.stringify(params),
    serviceName: 'cancelAppointOrderService',
  });
};

// 仓库查询接口
export const queryAppointOrderWarehouseService = async () => {
  return new Promise((resolve) => {
    diorRequest('CDT_78f93P', 'process', {
      params: null,
      serviceName: 'queryAppointOrderWarehouseService',
    }).then((res) => {
      const { success, msg = '', model = [] } = res;
      if (success) {
        const categories = model?.map((item) => {
          return {
            label: item?.entityName,
            value: item?.entityCode,
          };
        });
        resolve(categories);
      } else {
        MessageError(msg || '数据异常');
      }
    })
      .catch(() => resolve([]));
  });
};
