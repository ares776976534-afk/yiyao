import React from 'react';
import {
  PO_PENDING_APPOINTMENT,
  BH_PENDING_CONFIRM,
  CO_COMPLETED,
  CO_CONFIRMED,
  CO_DISCREPANCY,
  CO_IN_TRANSIT,
  CO_RECEIVING,
  CANCELLED,
  CUSTOM_APPOINTMENT,
} from '@/constant';
import {
  wareHouseList,
} from '../../services/search';

export const SCHEMA_INPUT = 'input';
export const SCHEMA_RANGE_PICKER = 'rangePicker';
export const SCHEMA_SELECT = 'select';
export const SCHEMA_DATE_PICKER = 'datePicker';
export const SCHEMA_ASYNC_SELECT = 'asyncSelect';

const CREATE_TIME = {
  name: '创建日期',
  key: 'createTime',
  type: SCHEMA_RANGE_PICKER,
};

const GOODS_INFO = {
  name: '货品信息',
  key: 'goodsInfo',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入货品ID/名称',
  },
};

const ITEM_INFO = {
  name: '商品信息',
  key: 'itemInfo',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入商品ID/名称',
  },
};

const SKU_ID = {
  name: '规格ID',
  key: 'skuId',
  type: SCHEMA_INPUT,
};

const REPLENISHMENT_PLAN_ORDER_ID = {
  name: '补货单号',
  key: 'replenishmentPlanOrderId',
  type: SCHEMA_INPUT,
  opt: {
    placeholder: '请输入单号',
  },
};

const RESERVATION_TIME = {
  name: '预约时间',
  key: 'reservationTime',
  type: SCHEMA_DATE_PICKER,
};

const TALLY_SHEET_STATUS = {
  name: '差异状态',
  key: 'tallySheetStatus',
  type: SCHEMA_SELECT,
  values: [{
    label: '已创建',
    value: 'tallySheetCreated',
  }, {
    label: '已拒绝',
    value: 'tallySheetRefuse',
  }],
};

const WAREHOUSE_CODE = {
  name: '收货仓库',
  key: 'warehouseCode',
  type: SCHEMA_SELECT,
  fetchData: wareHouseList,
};

const WAREHOUSE_CODE_2 = {
  name: '补货仓库',
  key: 'warehouseCode',
  type: SCHEMA_SELECT,
  fetchData: wareHouseList,
};

const DELIVERY_METHOD = {
  name: '送货方式',
  key: 'deliveryTypeCode',
  type: SCHEMA_SELECT,
  values: [{
    label: '上门揽',
    value: 'doorToDoorPickUp',
  }, {
    label: '自行送货',
    value: 'selfSending',
  }],
};

export default (type, opt = {}) => {
  switch (type) {
    case PO_PENDING_APPOINTMENT:
      return [
        CREATE_TIME, GOODS_INFO, ITEM_INFO, SKU_ID, WAREHOUSE_CODE, REPLENISHMENT_PLAN_ORDER_ID,
      ];
    case BH_PENDING_CONFIRM:
      return [
        CREATE_TIME, GOODS_INFO, ITEM_INFO, SKU_ID, REPLENISHMENT_PLAN_ORDER_ID,
      ];
    case CO_COMPLETED:
      return [
        CREATE_TIME, REPLENISHMENT_PLAN_ORDER_ID, WAREHOUSE_CODE, GOODS_INFO, ITEM_INFO, SKU_ID,
      ];
    case CO_CONFIRMED:
      return [
        CREATE_TIME, RESERVATION_TIME, WAREHOUSE_CODE_2, REPLENISHMENT_PLAN_ORDER_ID, GOODS_INFO, ITEM_INFO, SKU_ID, DELIVERY_METHOD,
      ];
    case CO_DISCREPANCY:
      return [
        CREATE_TIME, REPLENISHMENT_PLAN_ORDER_ID, WAREHOUSE_CODE, GOODS_INFO, ITEM_INFO, SKU_ID, TALLY_SHEET_STATUS,
      ];
    case CO_IN_TRANSIT:
      return [
        CREATE_TIME, REPLENISHMENT_PLAN_ORDER_ID, GOODS_INFO, ITEM_INFO, SKU_ID, DELIVERY_METHOD,
      ];
    case CANCELLED:
      return [
        CREATE_TIME, REPLENISHMENT_PLAN_ORDER_ID, GOODS_INFO, ITEM_INFO, SKU_ID,
      ];
    case CO_RECEIVING:
      return [
        CREATE_TIME, REPLENISHMENT_PLAN_ORDER_ID, WAREHOUSE_CODE, GOODS_INFO, ITEM_INFO, SKU_ID,
      ];
    case CUSTOM_APPOINTMENT:
      return [
        {
          name: '预约日期',
          key: 'time',
          type: SCHEMA_DATE_PICKER,
          opt: opt['time'] || {},
        },
        {
          name: '预约时段',
          key: 'appointWave',
          type: SCHEMA_SELECT,
          values: [{
            label: '上午',
            value: '1',
          }, {
            label: '下午',
            value: '2',
          }],
        },
      ];
    default:
      return [
        CREATE_TIME, GOODS_INFO, ITEM_INFO, SKU_ID,
      ];
  }
};
