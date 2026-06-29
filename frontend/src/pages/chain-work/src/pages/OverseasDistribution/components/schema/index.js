import React from 'react';
import colSchema from './colSchema';
import filterSchema from './filterSchema';

const statusMap = {
  QQYX: '严选分销',
  NOT_HTQQ: '非分销',
  HTQQ_NOT_QQYX: '基础分销',
};
export default {
  colSchema,
  filterSchema,
  batchActionSchema: () => [],
  emptySchema: (status) => {
    return (
      <div>
        <div className="flex justify-center mb-[12px]">
          <img
            src="https://img.alicdn.com/imgextra/i2/O1CN01B87N3e24f2cWQ9oXY_!!6000000007417-2-tps-102-98.png"
            alt="img"
          />
        </div>
        <div className="text-[14px] text-[#999] leading-[17px]">您暂无商品加入{statusMap[status]}</div>
      </div>
    );
  },
};
