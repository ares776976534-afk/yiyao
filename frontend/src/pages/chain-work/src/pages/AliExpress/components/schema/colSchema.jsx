import React from 'react';
import Button from '@/components/UI/Button';
import { Balloon } from '@alifd/next';

// 商品信息
const ITEM_INFO = {
  title: '商品信息',
  dataIndex: 'itemId',
  cell: (value, index, record) => {
    const { imgUrl = '', offerName = '', offerId = '' } = record;
    const hasImage = !!imgUrl; // 是否有图片
    return (
      <div className="flex">
        {hasImage && <img className="rounded-[6px] h-[48px] w-[48px] mr-[10px]" src={imgUrl} alt="img" />}
        <div>
          {offerName.length < 32 ? (
            <div className={'text-[14px] text-[#333] text-ellipsis line-clamp-1'}>{offerName}</div>
          ) : (
            <Balloon.Tooltip
              trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1">{offerName}</div>}
              align="t"
              popupStyle={{ backgroundColor: '#333' }}
              popupClassName="products-business-tooltips"
            >
              <span className="text-[14px] text-[#fff]">{offerName}</span>
            </Balloon.Tooltip>
          )}
          <div className="text-[#999] text-[13px]">ID：{offerId}</div>
        </div>
      </div>
    );
  },
};

// 操作
const OPERATION = {
  title: '操作',
  dataIndex: 'operation',
  width: 120,
  cell: (value, index, record, { onActionClick = () => { } }) => <Button type="normal:primary-ghost" style={{ height: '24px', fontSize: '12px' }} onClick={() => onActionClick({ type: 'action', record })} disabled={!record?.canSignUp}>立即提报</Button>,
};

export default () => {
  return [ITEM_INFO, OPERATION];
};
