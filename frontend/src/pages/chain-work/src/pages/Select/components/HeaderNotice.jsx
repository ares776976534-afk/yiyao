import React from 'react';
import { Balloon } from '@alifd/next';


const { Tooltip } = Balloon;

export default ({ data = [] }) => {
  return (
    <div className="bg-[#FFF] flex flex-col rounded-[6px] p-[20px] gap-y-[12px]" >
      <div className="flex items-center gap-x-[4px]">
        <img className="w-[16px] h-[16px]" src="https://img.alicdn.com/imgextra/i1/O1CN01f6V9qW2ANXDZ7xPc3_!!6000000008191-2-tps-32-32.png" alt="" srcSet="" />
        <span className="text-[#333] text-[16px] font-[500] h-[19px] flex items-center">通知</span>
      </div>
      <div className="flex flex-col gap-y-[6px]">
        {
          data.map((item) => (
            <Tooltip
              v2
              trigger={
                <div className="text-[14px] text-[#333] w-[99%] text-ellipsis line-clamp-1" alt={item}>
                  {item}
                </div>
              }
              align="t"
              popupClassName="notic-borad-tooltip bg-[#333] text-[14px] leading-[22px] p-[12px]"
            >
              {item}
            </Tooltip>
          ))
        }
      </div>
    </div>
  );
};
