/* eslint-disable prefer-promise-reject-errors */
import mtop from './mtop';
import queryString from 'query-string';
import * as ajax from '@/service/ajax';

const isTagai = window.location.href.indexOf('tagai.alibaba-inc.com') > 0;
// const isTagai = window.location.href.indexOf('localhost') > 0;
const detailListHttpUrl = 'https://tagai.alibaba-inc.com/fxCrm/sample/querySampleListForCrm';


export const queryUserSampleList = (params) => {
  const {
    data,
    ...opts
  } = params;
  switch (isTagai) {
    case true:
      return new Promise((resolve, reject) => {
        const query = queryString.parse(window.location.search);
        ajax.request(detailListHttpUrl, resolve, { ...params.data, globalId: query?.globalId }, 'get', 'jsonp', 30, reject);
      });
    default:
      return new Promise((resolve, reject) => {
        mtop
          .request({
            api: 'mtop.alibaba.cbu.global.sampleSheet.queryUserSampleList',
            data,
            ...opts,
          })
          .then((res) => {
            if (res?.data?.bizSuccess === 'true') {
              resolve({
                success: true,
                data: res?.data?.data || [],
                pageNum: Number(res?.data?.pageNum || 1),
                total: Number(res?.data?.total || 1),
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
  }
};
