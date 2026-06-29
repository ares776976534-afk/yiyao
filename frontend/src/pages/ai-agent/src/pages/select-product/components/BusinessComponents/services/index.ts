import { httpRequest } from "@/services/mtop";
import { serviceBaseUrl } from "@/utils/env";

// 招商上传图片 接口
export const uploadImageForSelectProduct = async (params: any) => {
  const res = await httpRequest({
    url: `${serviceBaseUrl}/opp/find-provider/api/uploadImage`,
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res;
}

// 获取供应商偏好枚举
export const getSupplierPreferenceEnum = async (params: any) => {
  const res = await httpRequest({
    url: `${serviceBaseUrl}/opp/find-provider/api/getProviderPreference`,
    method: 'POST',
    body: params,
  });
  return res;
}