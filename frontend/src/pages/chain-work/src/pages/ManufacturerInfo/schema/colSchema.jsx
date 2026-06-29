import React from 'react';
import { Button } from '@alifd/next';
import CommonDialog from '@/components/FormDialog';
import actionSchema from './actionSchema';
import ColInfo from '../components/ColInfo';

const COMMODITY_INFO = {
  title: '商品信息',
  dataIndex: 'manufacturerModel',
  cell: (value, index, record) => {
    const { picUrl, title, itemId, price } = record || {};
    return (
      <ColInfo
        url={picUrl}
        title={title}
        id={itemId}
      >
        <div className="mt-[4px]">¥ {price}</div>
      </ColInfo>
    );
  },
};

const MANUFACTURER_INFO = {
  title: '制造商信息',
  dataIndex: 'manufacturer_info',
  cell: (value, index, record) => {
    const { manufacturerInfoDO } = record;
    const {
      detailedAddressCn,
      manufacturerAddress,
      manufacturerNameCn,
      phoneNum,
      email,
    } = manufacturerInfoDO;
    return (
      <div className="h-[80px]">
        {record?.hasManu ? <div>{`${manufacturerNameCn},${manufacturerAddress},${detailedAddressCn},${phoneNum},${email}`}</div> : <div>未设置制造商信息</div>}
      </div>
    );
  },
};

const ACTION_OPERATION = {
  title: '操作',
  dataIndex: 'action',
  cell: (value, index, record, others = {}) => {
    const { hasManu } = record;
    const { onActionClick = () => {} } = others;
    return (
      <div className={`flex ${!hasManu ? 'btn-group' : 'btn-group-no'} h-[80px]`}>
        {
          hasManu ? (
            <Button
              className="text-[13px]"
              type="primary"
              text
              onClick={() => CommonDialog.open({
                title: <div className="text-[16px] font-medium">修改制造商信息</div>,
                onSubmit: (values) => onActionClick({ type: 'edit', values: { itemId: record.itemId, ...values } }),
                schema: () => actionSchema(record),
                subName: '保存',
                labelAlign: 'top',
              })}
            >
              修改制造商
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => CommonDialog.open({
                title: <div className="text-[16px] font-medium">设置制造商信息</div>,
                onSubmit: (values) => onActionClick({ type: 'sub', values: { itemId: record.itemId, ...values } }),
                schema: () => actionSchema(record),
                subName: '保存',
                labelAlign: 'top',
              })}
            >
              设置制造商
            </Button>
          )
        }
      </div>
    );
  },
};

export default () => {
  return [COMMODITY_INFO, MANUFACTURER_INFO, ACTION_OPERATION];
};
