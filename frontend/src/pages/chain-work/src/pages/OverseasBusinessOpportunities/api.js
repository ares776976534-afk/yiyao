import { fetchItemMtop } from '@alife/dior-fetch-data';

export const getOppList = (params) => {
  return fetchItemMtop('CDT_4lfyEY', 'getOppByCondition', params);
};

// 国家、商机类型枚举值查询
export const queryOppEnums = () => {
  return fetchItemMtop('CDT_78ahyt', 'queryOppEnums', {});
};

// 报名全球严选
export const signUp = (params) => {
  return fetchItemMtop('CDT_77g0mc', 'signUp', params);
};

// 商机报名记录列表
export const querySignUpRecord = (params) => {
  return fetchItemMtop('CDT_77g0mc', 'querySignUpRecord', params);
};

// 商品曝光数据
export const queryItemExposureData = (params) => {
  return fetchItemMtop('CDT_77g0mc', 'queryItemExposureData', params);
};

/* ****************** 新品商机 ****************** */

// 查询 AI 商机总结
export const queryMatchItemAISummary = (params) => {
  return fetchItemMtop('CDT_78ahyt', 'queryMatchItemAISummary', params);
};

// 点击站内同款时：查询商机匹配商品结果接口
export const queryMatchItemList = (params) => {
  return fetchItemMtop('CDT_78ahyt', 'queryMatchItemList', params);
};

// 新品商机报名
export const newItemOppSignUp = (params) => {
  return fetchItemMtop('CDT_78ahyt', 'newItemOppSignUp', params);
};

/** ***************** 店铺品商机 ****************** */
// 查询全店是否加入全球严选
export const queryIsShopAutoJoin = () => {
  return fetchItemMtop('CDT_bpbyRf', 'queryIsShopAutoJoin', {});
};

export const openShopAutoJoin = () => {
  return fetchItemMtop('CDT_bpbyRf', 'openShopAutoJoin', {});
};

// 获取店铺品、新品商机中的筛选项
export const getOppFilterOption = (params) => {
  return fetchItemMtop('CDT_78ahyt', 'getOppFilterOption', params);
};
