import { SCHEMA_SELECT, SCHEMA_RANGE_PICKER, SCHEMA_INPUT_CASCADER } from '@/components/CommonTable/contanst';
import { BookingTypeList, InOutTypeList, StatusTypeList, WarehouseAreaTypeList } from '../enums';
import { queryAppointOrderWarehouseService } from '../service';

const arrayFieldProps = {
  placeholder: `可excel单列信息直接复制，复制后展开如下：
123456789900
123456789901
123456789902
123456789903
123456789904
123456789905
123456789906
123456789907
123456789908
123456789909
123456789910
123456789911
      `,
  maxLength: 1000,
  rows: 14,
  style: { width: '100%' },
};

export default () => {
  const OUT_ORDER_CODES = {
    key: 'outOrderCodes',
    type: SCHEMA_INPUT_CASCADER,
    opt: {
      placeholder: '待预约单据编号',
      arrayFieldProps,
    },
  };

  const APPOINT_ORDER_CODES = {
    key: 'appointOrderCodes',
    type: SCHEMA_INPUT_CASCADER,
    opt: {
      placeholder: '预约单编号',
      arrayFieldProps,
    },
  };

  const OUT_BUSINESS_ORDER_CODES = {
    key: 'outBusinessOrderCodes',
    type: SCHEMA_INPUT_CASCADER,
    opt: {
      placeholder: '关联业务单号',
      arrayFieldProps,
    },
  };

  const FULFILMENT_ORDER_CODES = {
    key: 'fulfilmentOrderCodes',
    type: SCHEMA_INPUT_CASCADER,
    opt: {
      placeholder: '履约执行单编号',
      arrayFieldProps,
    },
  };

  const ORDER_TYPES = {
    key: 'orderTypes',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '预约单类型',
      hasClear: true,
      mode: 'multiple',
    },
    values: BookingTypeList,
  };

  const IN_OUT_TYPES = {
    key: 'inboundType',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '出入库方式',
      hasClear: true,
      mode: 'multiple',
    },
    values: InOutTypeList,
  };

  const ENTITY_CODES = {
    key: 'entityCodes',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '仓库',
      hasClear: true,
      mode: 'multiple',
    },
    fetchData: queryAppointOrderWarehouseService,
  };

  const STATUS_LIST = {
    key: 'statusList',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '预约状态',
      hasClear: true,
    },
    values: StatusTypeList,
  };

  const SC_ITEM_IDS = {
    key: 'scItemIds',
    type: SCHEMA_INPUT_CASCADER,
    opt: {
      placeholder: '货品ID',
      arrayFieldProps,
    },
  };

  const WAREHOUSE_TYPE_LIST = {
    key: 'warehouseTypeList',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '库区类型',
      hasClear: true,
      mode: 'multiple',
    },
    values: WarehouseAreaTypeList,
  };

  const APPOINTMENT_DATE = {
    key: 'appointmentDate',
    type: SCHEMA_RANGE_PICKER,
    opt: {
      placeholder: '预约日期',
      hasClear: true,
      className: 'appointment-date',
    },
  };

  return [OUT_ORDER_CODES, APPOINT_ORDER_CODES, OUT_BUSINESS_ORDER_CODES, FULFILMENT_ORDER_CODES, ORDER_TYPES, IN_OUT_TYPES, ENTITY_CODES, STATUS_LIST, SC_ITEM_IDS, WAREHOUSE_TYPE_LIST, APPOINTMENT_DATE];
};
