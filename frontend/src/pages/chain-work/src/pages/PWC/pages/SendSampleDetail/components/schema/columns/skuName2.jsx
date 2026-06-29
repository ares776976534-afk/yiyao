import React from 'react';

export default ({ record }) => {
  const { dataList = [] } = record;
  return (
    <div className="pt-[16px]">
      {
        dataList.map((data) => {
          const { skuName = [] } = data;
          const name = skuName[1] || '-';
          return (
            <div className="text-[13px] text-[#333] mb-[24px] last:mb-0">
              {name}
            </div>
          );
        })
      }
    </div>
  );
};
