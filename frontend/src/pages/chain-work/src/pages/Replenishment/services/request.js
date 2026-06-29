import Mtop from '@/service/mtop';
const api_cache = {};

export const mtopRequest = (opt = {}) => {
  return Mtop.request({
    v: '1.0',
    ecode: 0,
    type: 'GET',
    dataType: 'jsonp',
    timeout: 20000,
    ...opt,
  });
};

export default (serviceName, { params = {}, type = 'GET', enableCache = false } = {}) => {
  return new Promise((resolve, reject) => {
    if (enableCache && api_cache[serviceName]) {
      resolve(api_cache[serviceName]);
    }
    mtopRequest({
      api: 'mtop.mbox.fc.common.gateway',
      data: {
        fcGroup: 'cbu-op-platform',
        fcName: 'replenishment-plan',
        serviceName,
        params: JSON.stringify({
          param: params,
        }),
      },
      type,
    })
      .then((res) => {
        if (enableCache && api_cache[serviceName]) {
          api_cache[serviceName] = res?.data;
        }
        resolve(res?.data);
      })
      .catch((err) => reject(err));
  });
};
