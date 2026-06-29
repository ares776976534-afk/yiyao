import React from 'react';

export default ({ children, title, subTitle, id, className = 'mb-[16px]', titleClassName = '' }) => {
  return (
    <div
      id={id}
      className={`bg-[#fff] p-[20px] rounded-[6px] shadow-[0px_1px_12px_0px_rgba(0, 0, 0, 0.01)] last:mb-0 ${className}`}
    >
      {(title || subTitle) && (
        <div className="flex row items-center justify-between">
          <div className={`text-[18px] text-[#333] font-[500] h-[19px] leading-[19px] ${titleClassName}`}>{title}</div>
          {subTitle && <div>{subTitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
