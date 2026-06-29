import request from './request';
import { systemTime } from '@/utlis';

export const listQuery = (params = {}) => {
  return new Promise((resolve) => {
    if (!params.subModuleCode) params.subModuleCode = params.currentStatus;
    request('moduleListQuery', { params })
      .then((res) => {
        if (res.success) {
          systemTime.set(res.systemTime);
          resolve(res);
        } else {
          resolve({});
        }
      })
      .catch(() => resolve({}));
  });
};

export const reservationList = (params = []) => {
  return new Promise((resolve) => {
    request('toReservation', { params: { billInfo: params }, type: 'POST' })
      .then((res) => {
        resolve(res);
      })
      .catch(() => resolve({}));
  });
};

export const wareHouseList = () => {
  return new Promise((resolve) => {
    request('wareHouseService', { params: {}, enableCache: true })
      .then((res) => {
        if (res.success && res.model) {
          resolve(res.model || []);
        } else {
          resolve([]);
        }
      })
      .catch(() => resolve([]));
  });
};

// 查询仓库信息
export const queryWareHouseInfo = (billInfo) => {
  return new Promise((resolve) => {
    request('queryWareHouse', { params: { billInfo } })
      .then((res) => {
        resolve(res?.model || {});
      })
      .catch(() => resolve({}));
  });
};
