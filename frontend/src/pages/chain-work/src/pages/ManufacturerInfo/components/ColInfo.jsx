import React from 'react';
import { Balloon } from '@alifd/next';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';

export default ({ url, title, id, children }) => {
  const hasImage = !!url;
  return (
    <div className="mt-[4px] mb-[4px] flex items-center w-[100px]">
      {hasImage && (
        <a
          rel="noreferrer"
          style={{ cursor: 'pointer' }}
        >
          <div className="w-[80px] h-[80px] mr-[12px] ">
            <img className="rounded-[6px]" src={url} alt="img" />
          </div>
        </a>
      )}
      <div className="h-[80px] flex justify-between w-full">
        <div className="flex flex-col">
          {title?.length < 32 ? (
            <span className="w-[210px] text-[13px] text-[#333] text-ellipsis line-clamp-2 mb-[2px]"> {title}</span>
          ) : (
            <BallonTooltip
              trigger={<span className="w-[210px] text-[13px] text-[#333] text-ellipsis line-clamp-2 mb-[2px]">{title}</span>}
              content={title}
            />
          )}
          <div className="text-[#999] text-[13px]">ID：{id}</div>
          {children}
        </div>
      </div>
    </div>
  );
};
