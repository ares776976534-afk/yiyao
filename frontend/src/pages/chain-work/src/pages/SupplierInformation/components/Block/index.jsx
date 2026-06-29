import React from 'react';

export default ({ title = null, subTitle = null, children = null, id }) => {
  return (
    <div className={`flex flex-col bg-[#FFF] rounded-[6px] p-[20px] ${id === 'newProductCapability' ? '' : 'mt-[16px]'}`} id={id}>
      {
        title && (
          <div className="flex flex-row border-b-[1px] border-solid border-[#E5E5E5] pb-[12px] items-end mb-[20px]">
            <div className="text-[#333] font-[500] text-[16px] h-[19px]">
              {title}
            </div>
            {
              subTitle && (
                <div className="text-[#999] text-[12px] ml-[8px] h-[14px]">{subTitle}</div>
              )
            }
          </div>
        )
      }
      <div>
        {
          children
        }
      </div>
    </div>
  );
};
