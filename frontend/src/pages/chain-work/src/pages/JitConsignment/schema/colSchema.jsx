import React from 'react';
import { Balloon } from '@alifd/next';

const SUPPLY_PRODUCTS = {
  title: '供货产品',
  dataIndex: 'offerId',
  cell: (value, index, record) => {
    const { offerTitle, imageUrl, offerId, skuDesc } = record;
    const hasImage = !!imageUrl; // 是否有图片
    return (
      <div className="mb-[3px] flex">
        {hasImage && (
          <div className="w-[60px] h-[60px] mr-[8px] ">
            <img className="rounded-[6px]" src={imageUrl} alt="img" />
          </div>
        )}
        <div className="flex justify-between w-full">
          <div className="flex flex-col justify-between">
            {offerTitle?.length < 32 ? (
              <span className="w-[308px] text-[14px] text-[#333] text-ellipsis line-clamp-1"> {offerTitle}</span>
            ) : (
              <Balloon.Tooltip
                trigger={<div className="w-[308px] text-[14px] text-[#333] text-ellipsis line-clamp-1">{offerTitle}</div>}
                align="t"
                popupStyle={{ backgroundColor: '#333' }}
                popupClassName="products-business-tooltips"
              >
                <span className="">{offerTitle}</span>
              </Balloon.Tooltip>
            )}
            <div className="text-[#999] text-[12px]">供货产品ID：{offerId}</div>
            <div className="text-[#999] text-[12px]">规格：{skuDesc.map(e => e.specValue).join('/')}</div>
          </div>
        </div>
      </div>
    );
  },
};
// 下单件数
const ORDER_QUANTITY = {
  title: '下单数量',
  dataIndex: 'quantity',
  width: 200,
  cell: (value) => value,
};
export default () => {
  return [SUPPLY_PRODUCTS, ORDER_QUANTITY];
};
