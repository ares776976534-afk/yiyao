import { httpRequest } from '@/services/mtop';
import { selApiBaseUrl } from '@/utils/env';

export const search = async (params: any) => {
  const res = await httpRequest({
    url: `${selApiBaseUrl}/opp/sel/api/category/search`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};