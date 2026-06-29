import diorRequest from '@/service/diorRequest';
import Message from '@/components/UI/Message';

// 获取定招商机卡片
export const pageBargainOpp = (request) => {
  return new Promise((resolve) => {
    diorRequest('CDT_48gM9v', 'pageBargainOpp', request)
      .then((res) => {
        const { list = [], success, msg = '数据异常', total = 0 } = res;
        if (success) {
          const data = Object.assign({}, { model: list, total: Number(total) });
          resolve(data);
        } else {
          Message._show({ content: msg, type: 'error' });
        }
      })
      .catch(() => resolve(Object.assign({}, { model: [], total: 0 })));
  });
};

// 商家接受议价
export const acceptBargainOpp = async (request) => {
  return diorRequest('CDT_48gM9v', 'acceptBargainOpp', request);
};
