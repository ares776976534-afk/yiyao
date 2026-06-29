import { httpRequest } from '@/services/mtop';
import { spApiBaseUrl, selApiBaseUrl, inquiryApiBaseUrl } from '@/utils/env';

export const queryReviewTagReviews = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/improve-product/queryReviewTagReviews`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

export const queryProductReviews = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/improve-product/queryProductReviews`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

export const listKeywords = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/get-keyword-list`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 风控关键词
export const riskCheck = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/keyword/riskCheck`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 下载报告
export const downloadReport = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/report/download`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 导出选商报告
export const exportSelectProductReport = async (params: any) => {
  const res = await httpRequest({
    url: `${spApiBaseUrl}/opp/select-provider/api/getReportDownloadUrl`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

// 获取状态
export const getStatus = async (params: any) => {
  const res = await httpRequest({
    url: `${inquiryApiBaseUrl}/api/inquiry/task/status?taskId=${params}`,
    method: 'GET',
  })
  return res;
}