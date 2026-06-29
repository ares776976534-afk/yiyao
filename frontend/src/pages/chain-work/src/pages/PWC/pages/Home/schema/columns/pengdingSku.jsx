import React, { useState } from 'react';
import { Button } from '@alifd/next';

const EXPEND_COUNT = 3;

export default ({ value = [], index, record }) => {
  const [expend, setExpend] = useState(false);
  const skuInfo = value.map((item) => ({ ...item, skuList: item?.skuName?.split(';') }));
  const skuInfoLength = skuInfo.length;
  const expendBtnText = expend ? '收起' : '展开';
  const expendCount = expend ? skuInfoLength : EXPEND_COUNT;
  const handleExpend = () => {
    setExpend(!expend);
  };

  return (
    <div>
      {
        skuInfo.slice(0, expendCount).map((sku) => {
          const [skuOne = '', skuTwo = ''] = sku.skuList || [];
          return (
            <div className="flex flex-row text-[13px] text-[#666] items-center mb-[4px] last:mb-0">
              <span className="truncate w-[82px] h-[18px] mr-[20px]">
                {skuOne || '-'}
              </span>
              <span className="h-[18px]">
                {skuTwo}
              </span>
            </div>
          );
        })
      }
      {(skuInfoLength > EXPEND_COUNT) && <Button text type="primary" onClick={handleExpend}>{expendBtnText}</Button>}
      {skuInfoLength === 0 && <span className="text-[13px] text-[#666] ">-</span>}
    </div>
  );
};
