import React, { useState } from 'react';

export default () => {
  const [isShow, setIsShow] = useState(false);
  return {
    hasRowSelection: true,
    showSelectTip: false,
    primaryKey: 'itemId',
    leftAction: ({ checked, onActionClick = () => {} }) => {
      return (
        <div className="mb-[8px]">
          <div className="flex items-center">
            <div
              onClick={() => {
                if (checked.length > 0) {
                  setIsShow(false);
                  onActionClick({ type: 'batch_settings', values: checked });
                } else {
                  setIsShow(true);
                }
              }}
              className="w-[160px] h-[32px] rounded-[6px] opacity-100 flex flex-row justify-center items-center p-[10px] px-[16px] gap-[8px] bg-[#FFFFFF] box-border border border-[#0077FF] cursor-pointer text-[#0077FF] text-[14px]"
            >
              批量设置制造商信息
            </div>
            {isShow && !checked.length && <span className="text-[#FF5151] ml-[8px]">需要先勾选商品</span>}
          </div>
        </div>
      );
    },
  };
};
