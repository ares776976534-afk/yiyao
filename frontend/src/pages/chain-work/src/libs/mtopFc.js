import mtop from './mtop';
import { getUmidToken } from '@/utlis';

const api_cache = {};

export default async (
  serviceName,
  {
    params = {},
    type = 'GET',
    enableCache = false,
    enableToken = false,
    api = 'mtop.mbox.fc.common.gateway',
  } = {},
) => {
  return new Promise(async (resolve, reject) => {
    const _params = params;
    if (enableCache && api_cache[serviceName]) {
      resolve(api_cache[serviceName]);
    }
    let token = null;
    if (enableToken) {
      token = await getUmidToken();
      _params.token = token;
    }
    console.log('_params', _params);
    mtop.request({
      api,
      data: {
        fcGroup: 'cbu-op-platform',
        fcName: 'replenishment-plan',
        serviceName,
        params: JSON.stringify({
          param: _params,
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
