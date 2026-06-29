import React from 'react';
import { Button } from '@alifd/next';

export default ({ list = [], onClick }) => {
  return (
    <div>
      {
        list?.map(({ effect, text, title, actionName, actionCode }) => {
          return (
            <div className="py-[12px] px-[20px] h-full w-[372px] ml-[16px] bg-[#fff] rounded-[6px] relative overflow-hidden">
              <div className="flex items-center mb-[14px] mt-[8.5px] gap-[8px]">
                <div className="text-[#333] text-[16px] font-medium leading-[19px] mr-[8px]">{title}</div>
                <div
                  style={{ background: 'rgba(251, 59, 32, 0.12)' }}
                  className="h-[20px] flex justify-center items-center px-[4px] rounded-[3px] text-[#FB3B20] text-[12px] leading-[14px] font-medium"
                >
                  {effect}
                </div>
              </div>
              <div className="flex items-center justify-between mb-[8px]">
                <div>
                  {text}
                </div>
                <div>
                  <Button type="primary" style={{ zIndex: 1000, borderRadius: '6px', width: '74px', height: '32px' }} onClick={() => onClick(actionCode)}>{actionName}</Button>
                </div>
                <img className="absolute right-[40px] top-[-14px] w-[123px] h-[114px]" src="https://img.alicdn.com/imgextra/i2/O1CN01mmRouT1rC6g6l0bnG_!!6000000005594-2-tps-246-228.png" alt="" srcSet="" />
              </div>
            </div>
          )
        })
      }
    </div>
  );
};