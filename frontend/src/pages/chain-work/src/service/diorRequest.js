import { fetchItemMtop } from '@alife/dior-fetch-data';
import { Logger } from '@/utlis';

const cacheStore = {};

export default function (interfaceID, interfaceName, params, options = {}) {
  const { cache = false } = options;
  const cacheKey = `${interfaceID}_${interfaceName}`;
  return new Promise((resolve, reject) => {
    if (cache && cacheStore[cacheKey] !== undefined) {
      resolve(cacheStore[cacheKey]);
    } else {
      fetchItemMtop(interfaceID, interfaceName, params)
        .then((res) => {
          const { success, content } = res;
          if (success) {
            cacheStore[cacheKey] = content;
            resolve(content);
          } else {
            Logger.saveRecord(res);
            reject({
              success: false,
              errorCode: res?.errCode,
              errorMessage: res?.errMsg || dealErrorBoby(interfaceID, interfaceName, res),
            });
          }
        })
        .catch((err) => {
          Logger.saveRecord(err);
          reject({
            success: false,
            errorCode: err?.errCode || err?.code,
            errorMessage: err?.errMsg || err?.msg,
          });
        });
    }
  });
}

const dealErrorBoby = (interfaceID, interfaceName, body) => {
  const msg = body['__raw__']?.['__failures__']?.[interfaceID]?.[interfaceName]?.['errMsg'] || ''
  if (msg.includes('timeout')) {
    return '接口超时，请重试'
  }
  return msg
}