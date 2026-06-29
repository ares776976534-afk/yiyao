import { SCHEMA_INPUT } from '@/components/CommonTable/contanst';

// 商品id
const TRANSACTION_ITEM_ID = {
  name: '商品id',
  key: 'itemId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入',
    hasClear: true,
    width: '280px',
  },
};

export default () => {
  return [TRANSACTION_ITEM_ID];
};
