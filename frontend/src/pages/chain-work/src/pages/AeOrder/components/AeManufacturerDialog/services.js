import diorRequest from '@/service/diorRequest';

export const getSignAgreement = (params) => {
  return diorRequest('CDT_9thI3z', 'signAgreement', params);
};

export const clickThinkLater = (params) => {
  return diorRequest('CDT_54bQie', 'clickThinkLater', params);
};
