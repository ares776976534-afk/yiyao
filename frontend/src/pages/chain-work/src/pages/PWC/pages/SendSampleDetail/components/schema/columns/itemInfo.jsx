import React from 'react';

const Item = (props) => {
  const { itemName, itemId, price, picture } = props;
  return (
    <div className="flex flex-row items-center py-[16px]">
      <img className="w-[56px] h-[56px] rounded-[2px] mr-[10px] border-[1px] border-[#E5E5E5] border-solid" src={picture} />
      <div className="flex flex-col text-[13px] text-[#333]">
        <span className="h-[18px] mb-[4px]">{itemName || '-'}</span>
        <span className="h-[16px] mb-[4px] text-[#999]">商品ID：{itemId || '-'}</span>
        <span className="h-[18px]">价格：{price || '-'}元</span>
      </div>
    </div>
  );
};

const Sku = (props) => {
  const { dataList = [] } = props;
  return (
    <div className="flex flex-col justify-center pt-[16px]">
      {
        dataList.map((data) => {
          const { skuName = [] } = data;
          const name = skuName[0] || '-';
          return (
            <div className="text-[13px] text-[#333] mb-[24px] last:mb-[16px]">
              {name}
            </div>
          );
        })
      }
    </div>
  );
};

export default ({ record }) => {
  const Comp = record.type === 'sku' ? Sku : Item;
  return (
    <Comp {...record} />
  );
};
