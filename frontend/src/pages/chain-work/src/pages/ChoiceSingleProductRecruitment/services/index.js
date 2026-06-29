import diorRequest from '@/service/diorRequest';
import mtopRequest from '@/service/mtop';

// 查询单品定招详情
export const getSingleItemSignUpDetail = (request) => {
  return diorRequest('CDT_a42Gl0', 'getSingleItemSignUpDetail', request);
};

// 提交单品定招
export const singleItemSignUp = (params) => {
  return new Promise((resolve, reject) => {
    mtopRequest
      .request({
        api: 'mtop.1688.ChoiceItemService.singleItemSignUp',
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
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};

export const getLogistics = (params) => {
  return new Promise((resolve, reject) => {
    mtopRequest
      .request({
        api: 'mtop.1688.LogisticsConfigurationService.getsingle',
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
          errorMessage: error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。',
        });
      });
  });
};
