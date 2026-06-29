import diorRequest from '@/service/diorRequest';
import Message from '@/components/UI/Message';

// 查询数据看板的数据
export const querySellerDataBoard = async () => {
  return diorRequest('CDT_4ekDme', 'querySellerDataBoard', {});
};

// 查询在售商品列表
export const queryAeOnSaleItems = async (param) => {
  return diorRequest('CDT_4ekDme', 'queryAeOnSaleItems', { param });
};

// 查询不在售商品列表
export const queryNotAeOnSaleItems = async (param) => {
  return diorRequest('CDT_4ekDme', 'queryNotAeOnSaleItems', { param });
};

// 申请上架（批量上架）
export const signUp = async (request) => {
  return diorRequest('CDT_4jaMvF', 'signUp', { request });
};

// 获取 AE 店铺品卡片列表
export const getOppCard = async (params) => {
  return diorRequest('CDT_4lfyEY', 'getOppCard', params);
};

// 获取 AE 商机列表
export const getOppByCondition = async (params) => {
  return diorRequest('CDT_4lfyEY', 'getOppByCondition', params);
};

// 查询店铺商品列表
export const queryOffer = async (param) => {
  return diorRequest('CDT_4jaMvF', 'queryOffer', param);
};

// 跨境页面查询类目
export const offerGrowthVirtualItem = () => {
  return new Promise((resolve, reject) => {
    diorRequest('CDT_27lzqH', 'offerGrowthVirtualItemActionService', {
      params: { platform: 'bigmarket', action: 'getCategoryTree' },
    })
      .then((res) => {
        resolve(res?.result?.data);
      })
      .catch((error) => {
        resolve([]);
        Message._show({ content: String(error?.errorMessage) || '系统繁忙，请稍后再试。', type: 'error' });
      });
  });
};

// 查询商家是否可以申请上架
export const canSellerSelfApply = async (params) => {
  return diorRequest('CDT_4ekDme', 'canSellerSelfApply', params);
};

// 查询是否要弹窗
export const queryIsPopWindow = async () => {
  return diorRequest('CDT_54bQie', 'queryIsPopWindow', {});
};

// 操作弹窗
export const operatePopWindow = async (params) => {
  return diorRequest('CDT_54bQie', 'operatePopWindow', params);
};
