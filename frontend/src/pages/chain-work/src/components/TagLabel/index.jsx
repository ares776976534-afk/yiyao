import React from 'react';

const tagStyle = {
  primary: 'text-[#0077FF] bg-[#F6FAFE] border-[#DBE5FF]',
  normal: 'text-[#666] border-[#DDD]',
};

export default ({ type = 'primary', children }) => {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[3px] h-[16px] p-[1px_2px] border-solid  border-[1px] ${tagStyle[type]} `}>
      <div className="text-[12px] h-[12px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
