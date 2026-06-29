import React from 'react';
import sendInfo from './columns/sendInfo';
import sendStatus from './columns/sendStatus';
import PengdingSku from './columns/pengdingSku';
import itemStatus from './columns/itemStatus';
import actions from './columns/actions';

const SEND_INFO = {
  title: '寄样信息',
  cell: sendInfo,
  // width: 310,
  align: 'left',
};

const PENDING_SKU = {
  title: '寄样SKU',
  cell: (value, index, record) => <PengdingSku value={value} index={index} record={record} />,
  dataIndex: 'skuList',
  align: 'left',
  // width: 184,
};

const SEND_STATUS = {
  title: '寄样状态',
  cell: sendStatus,
  dataIndex: 'status',
  width: 220,
  align: 'left',
};

const ITEM_STATUS = {
  title: '商品状态',
  cell: itemStatus,
  width: 120,
  align: 'left',
};

const ACTIONS = {
  title: '操作',
  cell: actions,
  width: 120,
};

export default () => {
  return [
    SEND_INFO,
    PENDING_SKU,
    SEND_STATUS,
    ITEM_STATUS,
    ACTIONS,
  ];
};
