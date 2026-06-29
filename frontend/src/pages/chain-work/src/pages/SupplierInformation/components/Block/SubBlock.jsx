import React from 'react';

export default ({ title = null, children = null }) => {
  return (
    <div className="flex flex-col mb-[12px] last:mb-0">
      <div className="text-[14px] text-[#333] mb-[12px] font-[500]">{title}</div>
      <div>
        {children}
      </div>
    </div>
  );
};
