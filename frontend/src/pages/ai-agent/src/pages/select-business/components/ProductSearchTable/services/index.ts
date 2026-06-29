import { httpRequest } from '@/services/mtop';
import { spApiBaseUrl } from '@/utils/env';

// 供应商排序
export const resultProcess = async (params: any) => {
  const res = await httpRequest({
    url: `${spApiBaseUrl}/opp/select-provider/api/resultProcess`,
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res;
};