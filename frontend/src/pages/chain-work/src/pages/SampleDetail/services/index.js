/* eslint-disable prefer-promise-reject-errors */
import mtop from './mtop';

export const printSampleBarcode = (params) => {
  const {
    data,
    ...opts
  } = params;
  return new Promise((resolve, reject) => {
    mtop
      .request({
        api: 'mtop.aliexpress.supply.marketing.print.sample.barcode',
        data,
        ...opts,
      })
      .then((res) => {
        const url = res?.data?.data;

        if (url) {
          resolve({
            success: true,
            url: res?.data?.data,
          });
        } else {
          reject({
            success: false,
            errorCode: res?.data?.errorCode,
            errorMessage: res?.data?.errorMsg,
          });
        }
      })
      .catch((err) => {
        reject({
          success: false,
          errorCode: err?.data?.errorCode,
          errorMessage: err?.data?.errorMsg || err?.ret?.[0] || '服务异常',
        });
      });
  });
};

export const submitMailNo = (params) => {
  const {
    data,
    ...opts
  } = params;
  return new Promise((resolve, reject) => {
    mtop
      .request({
        api: 'mtop.alibaba.cbu.global.sampleSheet.submitMailNo',
        data,
        ...opts,
      })
      .then((res) => {
        if (res?.data?.bizSuccess === 'true') {
          resolve({
            success: true,
            result: res?.data?.data === 'true',
          });
        } else {
          reject({
            success: false,
            errorCode: res?.data?.errorCode,
            errorMessage: res?.data?.errorMsg,
          });
        }
      })
      .catch((err) => {
        reject({
          success: false,
          errorCode: err?.data?.errorCode,
          errorMessage: err?.data?.errorMsg || err?.ret?.[0] || '服务异常',
        });
      });
  });
};
