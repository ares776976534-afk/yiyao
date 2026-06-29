import { httpRequest } from '@/services/mtop';
import { selApiBaseUrl } from '@/utils/env';

// 获取榜单
export const queryList = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/ranking/overall/list`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 机会赛道榜明细数据
export const queryOpportunityKeywordList = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/ranking/keyword/list`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 全网商品榜明细数据
export const queryProductKeywordList = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/ranking/product/list`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 全网商品榜类目检索
export const queryProductCategoryList = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/ranking/product/category`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 机会赛道榜类目检索
export const queryOpportunityKeywordCategoryList = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/ranking/keyword/category`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};