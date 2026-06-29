import React from 'react';

function HeaderInfoCard({ itemTitle = '', itemImageUrl = '', itemId = '' }) {
  const hasImage = !!itemImageUrl; // 是否有图片
  return (
    <div className="flex mt-[20px]">
      {hasImage && <img src={itemImageUrl} alt="img" className="w-[64px] h-[64px] mr-[8px] rounded-[6px]" />}
      <div className="w-full h-[64px]">
        <div className="text-[13px] text-[#333] mt-[4px]">{itemTitle}</div>
        <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
      </div>
    </div>
  );
}

export default HeaderInfoCard;
