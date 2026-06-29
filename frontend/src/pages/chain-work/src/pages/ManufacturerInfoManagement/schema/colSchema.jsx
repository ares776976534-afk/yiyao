import React from 'react';
import { Button, Icon } from '@alifd/next';
import FormDialog from '@/components/FormDialog';
import FormModel from '../FormModal';

const TagText = (props) => {
  return (
    <div className="flex flex-row">
      <span className="text-[12px] text-[#00000066] flex flex-col items-center justify-center px-[2px] border border-[#00000033] rounded-[3px]">{props?.children}</span>
    </div>
  );
};

const MANUFACTURER_NAME = {
  title: '制造商名称',
  dataIndex: 'manufacturerNameCn',
  width: 312,
  cell: (value, index, record) => {
    const { manufacturerModel = {} } = record;
    const { manufacturerNameCn = '', type } = manufacturerModel;
    const isDefault = type === 'DEFAULT' || type === 'AGREE_SHARE';
    return (
      <div className="flex flex-col gap-y-[4px]">
        {manufacturerNameCn || ''}
        {isDefault && <TagText>默认</TagText>}
      </div>
    );
  },
};

const MANUFACTURER_ADDRESS = {
  title: '制造商地址',
  dataIndex: 'manufacturerAddress',
  cell: (value, index, record) => record?.manufacturerModel?.manufacturerAddress || '',
};


const PHONE = {
  title: '手机/固定电话号码',
  dataIndex: 'phoneNumber',
  cell: (value, index, record) => record?.manufacturerModel?.phoneNumber || '',
};

const EMAIL = {
  title: '电子邮箱',
  dataIndex: 'email',
  cell: (value, index, record) => record?.manufacturerModel?.email || '',
};

export default () => {
  const onJump = (manufacturerModel) => {
    const { manufacturerId } = manufacturerModel;
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('manufacturerId', manufacturerId);
    // currentUrl.searchParams.set('manufacturerNameCn', manufacturerNameCn);
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/manufacturerinfo.html${search}`;
  };
  const ACTION_OPERATION = {
    title: '操作',
    dataIndex: 'action',
    cell: (value, index, record, others = {}) => {
      const { onActionClick = () => { } } = others;
      const { manufacturerModel } = record;
      const {
        manufacturerId,
        manufacturerNameCn,
        manufacturerNameEn,
        manufacturerAddress,
        detailedAddressCn,
        detailedAddressEn,
        areaCode,
        phoneNumber,
        email,
      } = manufacturerModel;
      return (
        <div className="flex items-center">
          <Button
            className="mr-[12px] text-[13px]"
            type="primary"
            text
            onClick={() => FormModel.open({
              title: <div className="text-[16px] font-medium">修改制造商信息</div>,
              onSubmit: (v) => onActionClick({
                type: 'edit',
                record: {
                  action: 1,
                  manufacturerModel: {
                    areaCode,
                    ...v,
                    manufacturerId,
                    type: 'MANUAL',
                  },
                },
              }),
              values: {
                manufacturerNameCn,
                manufacturerNameEn,
                manufacturerAddress,
                detailedAddressCn,
                detailedAddressEn,
                areaCode,
                phoneNumber,
                email,
              },
              labelAlign: 'left',
              subName: '保存',
            })}
          >
            修改
          </Button>
          <Button
            className="mr-[12px] text-[13px]"
            type="primary"
            text
            onClick={() => FormDialog.open({
              title: <div className="text-[16px] font-medium"><Icon type="ic_info" className="text-[#0077FF] mr-[8px]" />确定要删除该制造商信息吗？</div>,
              onSubmit: () => onActionClick({
                type: 'delete',
                record: {
                  action: 2,
                  manufacturerModel: {
                    manufacturerId,
                    type: 'MANUAL',
                  },
                },
              }),
              schema: () => (
                [
                  {
                    key: 'others',
                    children: <div className="mt-[15px]">该制造商尚未关联任何商品。</div>,
                  },
                ]
              ),
              subName: '确定删除',
              width: 400,
            })}
            disabled={!record?.deletable}
          >
            删除
          </Button>
          <div
            className="w-[110px] h-[24px] rounded-[4px] opacity-100 flex flex-row justify-center items-center p-[10px] px-[12px] gap-[4px] bg-[#FFFFFF] box-border border border-[#0077FF] cursor-pointer text-[#0077FF] text-[12px]"
            onClick={() => onJump(manufacturerModel)}
          >
            查看关联商品
          </div>
        </div>
      );
    },
  };
  return [MANUFACTURER_NAME, MANUFACTURER_ADDRESS, PHONE, EMAIL, ACTION_OPERATION];
};
