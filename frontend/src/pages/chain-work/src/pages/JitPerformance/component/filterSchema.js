import { SCHEMA_SELECT, SCHEMA_INPUT, SCHEMA_RANGE_PICKER } from '@/components/CommonTable/contanst';

// 交易单号
const TRANSACTION_NUM = {
  name: '订单号',
  key: 'purchaseOrderId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入',
    hasClear: true,
  },
};

// 创建时间
const CREATE_TIME = {
  name: '创建时间',
  key: 'createOrderTime',
  type: SCHEMA_RANGE_PICKER,
  opt: {
    placeholder: '请输入',
    hasClear: true,
  },
};

// 供货产品ID
const SUPPLY_PRODUCT_ID = {
  name: '供货产品ID',
  key: 'offerId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入',
    hasClear: true,
  },
};

// 履约状态
const PERFORMANCE_STATUS = {
  name: '履约状态',
  key: 'statusSet',
  type: SCHEMA_SELECT,
  opt: {
    placeholder: '请输入',
    hasClear: true,
  },
  values: [
    { label: '待发货', value: 'WAIT_DELIVERY' },
    { label: '待揽收', value: 'CONSIGN' },
    { label: '待收货', value: 'ACCEPT' },
    { label: '已送达', value: 'DELIVERED' },
    { label: '收货完成', value: 'CONFIRMED' },
    { label: '已关闭', value: 'CANCEL' },
  ],
};

const filterSchema = [TRANSACTION_NUM, CREATE_TIME, SUPPLY_PRODUCT_ID, PERFORMANCE_STATUS];

export default (type) => {
  switch (type) {
    case 'WAIT_DELIVERY':
      return filterSchema.slice(0, 3);
    default:
      return filterSchema;
  }
};
