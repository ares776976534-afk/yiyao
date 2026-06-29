import diorRequest from '@/service/diorRequest';
import Message from '@/components/UI/Message';

// 管理托管产品
export const manageSupplyProduct = (request) => {
  return diorRequest('CDT_a42Gl0', 'manageSupplyProduct', request);
};

// 更新托管产品
export const updateSupplyProduct = (request) => {
  return diorRequest('CDT_a42Gl0', 'updateSupplyProduct', request);
};

