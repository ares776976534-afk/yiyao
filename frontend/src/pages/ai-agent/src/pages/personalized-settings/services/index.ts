import { httpRequest } from "@/services/mtop";
import { inquiryApiBaseUrl } from "@/utils/env";

// 同步1688收藏
export const sync = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/custom/supplier/sync`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 供应商库列表
export const list = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/custom/supplier/list`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 供应商库搜索
export const search = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/custom/supplier/search`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 添加供应商
export const add = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/custom/supplier/add`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 供应商库状态
export const canStatus = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/custom/supplier/canStatus`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 删除供应商
export const deleteData = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/custom/supplier/delete`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}
