export const SCHEMA_INPUT = 'input';

const ITEM_ID = {
  name: '商品ID',
  key: 'itemId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入',
    hasClear: true,
  },
};

const ITEM_NAME = {
  name: '商品名称',
  key: 'itemName',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入',
    hasClear: true,
  },
};

export default (type) => {
  switch (type) {
    case '0':
      return [ITEM_ID, ITEM_NAME];
    case '1':
      return [];
    default:
      return [];
  }
};
