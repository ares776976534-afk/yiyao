import React from 'react';

export default ({ record }) => {
  const { dataList = [] } = record;
  const data = dataList[0] || {};
  const { barCode } = data;
  const name = barCode || '-';
  return (
    <div className="text-[13px] text-[#333] mb-[24px] last:mb-0 pt-[16px]">
      {name}
    </div>
  );
};
