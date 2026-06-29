import { fetchItemMtop, fetchItem } from '@alife/dior-fetch-data';

const is1688Host = location.host.indexOf('1688.com') > -1

interface Options {
  mtop?: boolean;
}

// 自动判断是否使用mtop
export default (interfaceID: string, interfaceName: string, params: any, options: Options = {}) => {
  let { mtop } = options;

  if (mtop === undefined) {
    mtop = is1688Host;
  }
  const reqFn = mtop ? fetchItemMtop : fetchItem;

  return new Promise((resolve, reject) => {
    reqFn(interfaceID, interfaceName, params)
    .then((res: any) => {
      const { success, content } = res;
      if (success) {
        resolve(content);
      } else {
        reject({
          success: false,
          errorCode: res?.errCode,
          errorMessage: res?.errMsg,
        });
      }
    })
    .catch((err: any) => {
      reject({
        success: false,
        errorCode: err?.errCode || err?.code,
        errorMessage: err?.errMsg || err?.msg,
      });
    });
  });
}