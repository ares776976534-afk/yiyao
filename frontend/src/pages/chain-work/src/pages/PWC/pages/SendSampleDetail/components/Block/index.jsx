import React from 'react';

export default ({ title, children }) => {
  return (
    <div className="flex flex-col bg-[#fff] px-[20px] py-[20px] rounded-[6px] shadow-[0px_0px_6px_0px_rgba(0,0,0,0.05)] mb-[16px] last:mb-0">
      <div className="text-[#333333] text-[16px] font-[500] mb-[20px]">{title}</div>
      <div>
        {children}
      </div>
    </div>
  );
};
