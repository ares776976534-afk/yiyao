import { SCHEMA_INPUT } from '@/components/CommonTable/contanst';

const PRODUCT_NAMEID = {
  name: '商品ID',
  key: 'itemId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '输入文本',
    hasClear: true,
  },
};

export default () => {
  return [PRODUCT_NAMEID];
};
