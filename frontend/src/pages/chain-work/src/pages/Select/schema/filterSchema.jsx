import { useEffect, useState } from 'react';
import { queryItemSearchContent } from '../services';
import { SCHEMA_SELECT, SCHEMA_INPUT, SCHEMA_CHECKBOX } from '@/components/CommonTable/contanst';

export default (status) => {
  const [result, setResult] = useState({});
  useEffect(() => {
    status === '2' && queryItemSearchContent().then((res) => {
      setResult(res);
    });
  }, []);
  const PRODUCT_NAMEID = {
    name: '商品ID',
    key: 'searchInfo',
    type: SCHEMA_INPUT,
    opt: {
      placeholder: '输入文本',
      hasClear: true,
    },
  };
  const PRODUCT_TYPE = {
    name: '商品类型',
    key: 'itemType',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
    },
    values: result?.itemType?.map((item) => ({ label: item.desc, value: item.code })),
  };
  const PRODUCT_ID = {
    name: '已获权益',
    key: 'existRight',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
    },
    values: result?.rightType?.map((item) => ({ label: item.desc, value: item.code })),
  };
  const PRODUCT_NAME = {
    name: '优化任务',
    key: 'unFinishedTask',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
    },
    values: result?.taskType?.map((item) => ({ label: item.desc, value: item.code })),
  };
  const SALES_CHANNEL = {
    name: '跨境托管售卖渠道',
    key: 'saleChannel',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      multiple: true,
    },
    values: result?.saleChannel?.map((item) => ({ label: item.desc, value: item.code })),
  };
  // 发货方式
  // const DELIVERY_TYPE = {
  //   name: '发货方式',
  //   key: 'deliveryType',
  //   type: SCHEMA_SELECT,
  //   opt: {
  //     placeholder: '请选择',
  //     hasClear: true,
  //   },
  //   values: [],
  // };
  // 筛选0库存商品
  const ZERO_STOCK = {
    name: '筛选0库存商品',
    key: 'isZeroStock',
    type: SCHEMA_CHECKBOX,
  };
  switch (status) {
    case '1':
      return [PRODUCT_NAMEID];
    case '2':
      return [PRODUCT_NAMEID, PRODUCT_TYPE, PRODUCT_ID, PRODUCT_NAME, SALES_CHANNEL, ZERO_STOCK];
    default:
      return [];
  }
};
