import React from 'react';
import { SCHEMA_SELECT, SCHEMA_INPUT } from '@/components/CommonTable/contanst';

const SEND_STATUS = {
  name: '寄样状态',
  key: 'status',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请选择',
    hasClear: true,
  },
  values: [
    {
      label: '全部',
      value: '',
    },
    {
      label: '已寄样',
      value: 'SEND',
    },
    {
      label: '待寄样',
      value: 'WAITING',
    },
    {
      label: '样品已处理',
      value: 'OVER',
    },
  ],
};

const ITEM_ID = {
  name: '商品ID',
  key: 'itemId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入商品ID',
  },
};

export default () => {
  return [SEND_STATUS, ITEM_ID];
};
