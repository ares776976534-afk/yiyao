import React, { useState, useEffect } from 'react';

const normalItemWrapStyle = 'border-[transparent]';
const normalItemTextStyle = 'text-[#666] font-[400]';
const activeItemWrapStyle = 'border-[#0077FF]';
const activeItemTextStyle = 'text-[#0077FF] font-[500]';

export default ({ data = [], onClick = () => {}, rightPanel = null, active = '' }) => {
  useEffect(() => {
    const firstElement = document.getElementById(data[0]?.key);
    if (firstElement) {
      const offset = 133;
      const targetPosition = firstElement.offsetTop - offset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  }, [data]);

  return (
    <div className="flex flex-row bg-[#FFF] rounded-[6px] p-[12px_20px] justify-between">
      <div className="flex flex-row">
        {
          data.map((item) => {
            const { key, title, badgeCount = null } = item;
            const isActive = active === item?.key;
            return (
              <div onClick={() => onClick(item)} key={key} className={`flex flex-row items-center justify-center h-[34px] px-[20px] cursor-pointer border-b-[2px] border-solid ${isActive ? activeItemWrapStyle : normalItemWrapStyle}`}>
                <span className={`flex flex-row items-center justify-center text-[16px] ${isActive ? activeItemTextStyle : normalItemTextStyle}`}>
                  {title}
                  {
                    badgeCount ? <span className="flex flex-row items-center justify-center w-[16px] h-[16px] rounded-[50%] bg-[#FFF2ED] text-[12px] text-[#FB3B20] ml-[6px]">{badgeCount}</span> : null
                  }
                </span>
              </div>
            );
          })
        }
      </div>
      {
        rightPanel ? <div className="flex flex-row justify-end">{rightPanel}</div> : null
      }
    </div>
  );
};