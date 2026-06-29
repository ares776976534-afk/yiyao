import { httpRequest } from '@/services/mtop';
import { selApiBaseUrl } from '@/utils/env';

export const querySameStyleProducts = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/product/querySameStyleProducts`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};

export const searchSkus = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/product/searchSkus`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};