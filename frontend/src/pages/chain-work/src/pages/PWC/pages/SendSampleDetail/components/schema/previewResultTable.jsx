import React from 'react';
import ItemInfo from './columns/itemInfo';
import SkuName2 from './columns/skuName2';
import MeasurementResults from './columns/measurementResults';

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
    title: '测量结果',
    colSpan: 2,
    dataIndex: 'value',
    cell: (value, index, record) => <MeasurementResults value={value} record={record} />,
    width: 320,
  },
];
