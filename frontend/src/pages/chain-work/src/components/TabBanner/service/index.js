import diorRequest from '@/service/diorRequest';

export const queryOrderNumsDashBoardService = async (params) => {
  return diorRequest('CDT_78f93P', 'process', {
    params: JSON.stringify(params),
    serviceName: 'queryOrderNumsDashBoardService',
  });
};
