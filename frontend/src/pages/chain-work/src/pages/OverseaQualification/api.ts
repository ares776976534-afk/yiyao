import diorRequest from '@/service/diorRequest';
import { Message } from '@alifd/next';

// 提交海外资质信息
export const submitQualificationsInfoService = (params: any) => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_a3aUuB', 'process', {
      params: JSON.stringify(params),
      serviceName: 'submitQualificationsInfoService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
  });
};


// 查询海外资质信息
export const queryQualificationsDetailService = () => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_a3aUuB', 'process', {
      // params: JSON.stringify(params),
      serviceName: 'queryQualificationsDetailService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
  });
};

// 是否展示全球工厂权益领取
export const isPossibleReceiveQqqyService = () => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_a3aUuB', 'process', {
      // params: JSON.stringify(params),
      serviceName: 'isPossibleReceiveQqqyService',
    })
      .then((res) => {
        if (!res || !res.success) {
          throw new Error(res?.msg);
        }
        resolve(res);
      })
      .catch((err) => {
        resolve({});
        Message.error(String(err?.errorMessage || err) || '系统繁忙，请稍后再试。');
      });
  });
};
