import React from 'react';
import CopyIcon from '@/components/CopyIcon';

export default (value, index, record) => {
  const { sampleId, itemId, itemName, price, picture } = record;
  return (
    <div className="flex flex-row">
      <img src={picture} className="w-[80px] h-[80px] mr-[10px] rounded-[2px] border-[1px] border-solid border-[#E5E5E5]/50" />
      <div className="flex flex-col ">
        <div className="flex flex-row items-center text-[13px] h-[16px] mb-[4px]">
          <span className="text-[#333] font-[500]">寄样ID：</span>
          {sampleId || '-'}
          <CopyIcon text={sampleId} />
        </div>
        <div className="text-[13px] h-[18px] mb-[4px] text-[#333] truncate w-[210px]" title={itemName}>
          {itemName || '-'}
        </div>
        <div className="flex flex-row items-center text-[13px] h-[16px] mb-[4px] text-[#999]">
          商品ID：{itemId || '-'}
        </div>
        <div className="flex flex-row items-center text-[13px] h-[18px] text-[#333]">
          价格：{price || '-'}元
        </div>
      </div>
    </div>
  );
};
