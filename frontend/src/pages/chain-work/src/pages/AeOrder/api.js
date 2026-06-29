import { fetchItemMtop } from '@alife/dior-fetch-data';

export const checkSendInfo = async (list = []) => {
  return fetchItemMtop('CDT_4nbIhY', 'checkSendInfo', {
    list,
  });
};

export const checkSendAndReceiveInfo = async (list = []) => {
  return fetchItemMtop('CDT_4nbNJr', 'checkSendAndReceiveInfo', {
    list,
  });
};

export const checkWhiteList = async () => {
  return fetchItemMtop('CDT_4ub00j', 'checkWhiteList', {});
};

export const isGray = async () => {
  return fetchItemMtop('CDT_7t9UjI', 'isGray', {});
};

export const getPrefillMfrInfo = async () => {
  return fetchItemMtop('CDT_86ajuJ', 'getPrefillMfrInfo', {});
};

// 打印接口
export const print = async (params) => {
  return fetchItemMtop('CDT_6ag5fU', 'print', params);
};