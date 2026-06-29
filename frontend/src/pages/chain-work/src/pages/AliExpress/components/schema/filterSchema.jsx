import { SCHEMA_INPUT, SCHEMA_CASCADER_SELECT } from '@/components/CommonTable/contanst';
import { offerGrowthVirtualItem } from '@/pages/AliExpress/services';

// 商品名称
const ITEM_NAME = {
  name: '商品名称',
  key: 'keyword',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '输入文本',
    width: 280,
    hasClear: true,
  },
};

// 商品id
const ITEM_ID = {
  name: '商品id',
  key: 'offerId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '输入文本',
    width: 280,
    hasClear: true,
  },
};

// 类目
const CATEGORY = {
  name: '类目',
  key: 'categoryId',
  type: SCHEMA_CASCADER_SELECT,
  opt: {
    placeholder: '请选择',
    width: 280,
    hasClear: true,
  },
  fetchData: offerGrowthVirtualItem,
};

export default () => {
  return [ITEM_NAME, ITEM_ID, CATEGORY];
};
