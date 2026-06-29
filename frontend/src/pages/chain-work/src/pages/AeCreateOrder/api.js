import { fetchItemMtop } from '@alife/dior-fetch-data';
import Mtop from '@/service/mtop';

export const getSendAndReceiveInfo = async (params) => {
  return fetchItemMtop('CDT_6ag5fU', 'getSendAndReceiveInfo', params);
};

export const cancelPickUpOrder = async (params) => {
  return fetchItemMtop('CDT_6ag5fU', 'cancelPickUpOrder', params);
};

export const createPickUpOrder = async (params) => {
  return Mtop.request({
    api: 'mtop.com.alibaba.national.ae.handleCreate',
    v: '1.0',
    timeout: 60 * 1000,
    type: 'POST',
    data: params,
  });
};

// export const closeOrderRequest = async (subOrderNo) => {
//   return Mtop.request({
//     api: 'mtop.com.alibaba.national.ae.cancelOrder',
//     v: '1.0',
//     timeout: 60 * 1000,
//     type: 'POST',
//     data: {
//       subOrderNo,
//     },
//   });
// };

export const querySendGoodsAddressList = async (params) => {
  return fetchItemMtop('CDT_7rbBUH', 'querySendGoodsAddressList', {
    params,
  });
};
