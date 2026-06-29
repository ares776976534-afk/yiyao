import { httpRequest } from "@/services/mtop";
import { inquiryApiBaseUrl, baseUrl } from "@/utils/env";

export const getSupplierList = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/supplier/search`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

export const getCollectSupplierList = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/supplier/collectSearch`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 询盘任务列表 接口
export const getTaskList = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/list`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 询盘任务进展&报告 接口
export const getTaskProgress = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/progress`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 上传图片 接口
export const uploadImage = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/item/upload`,
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
}

// 解析1688商品链接 接口
export const parse1688Link = async (link: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/item/link`,
    method: 'POST',
    body: JSON.stringify({
      offerLink: link,
    }),
  });
  return res;
}

// 获取询盘任务完成时间 接口
export const getFinishTime = async () => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/config/finishTime`,
    method: 'POST',
  })
  return res;
}

// 获取询盘问题 接口
export const getQuestionList = async () => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/question/recommand`,
    method: 'GET',
  })
  return res;
}

// 创建询盘任务 接口
export const postTask = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/submit`,
    method: 'POST',
    body: JSON.stringify(params),
  })
  return res;
}

// 查看任务详情 todo
export const getTaskDetail = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/detail?taskId=${params.taskId}`,
    method: 'GET',
  })
  return res;
}

// 收货地址查询
export const receiveAddressList = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/config/receiveAddressList`,
    method: 'GET',
  })
  return res;
}

// 根据图片推荐供应商 接口
export const getSupplierRecommend = async (params: { imgUrl: string }) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/supplier/recommend`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 导出询盘报告 接口
export const exportTaskReport = async (params: { taskId: string; type: string }) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/export`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 查询授权信息
export const getAuthInfo = async (params: any) => {
  const res = await httpRequest({
    url: `${baseUrl}/api/getAuthInfo?authType=cbu`,
    method: 'GET',
  })
  return res;
}

// 复制
export const copyTask = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/copy`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}

// 终止
export const stopTask = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/stop`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
}