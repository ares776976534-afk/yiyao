import React from 'react';
import ItemInfo from './columns/itemInfo';
import SkuName2 from './columns/skuName2';
import BarCode from './columns/barCode';
import SendAction from './columns/sendAction';

export default [
  {
    title: '商品信息',
    dataIndex: 'index',
    colSpan: 2,
    cell: (value, index, record) => <ItemInfo record={record} />,
  },
  {
    title: '',
    colSpan: 0,
    dataIndex: 'value',
    cell: (value, index, record) => <SkuName2 value={value} record={record} />,
    width: 350,
  },
  {
    title: '样品条码',
    colSpan: 2,
    dataIndex: 'value',
    cell: (value, index, record) => <BarCode value={value} record={record} />,
    width: 320,
  },
  {
    title: '',
    colSpan: 0,
    cell: (value, index, record, onCellAction) => <SendAction value={value} record={record} onCellAction={onCellAction} />,
    width: 160,
    align: 'right',
  },
];
