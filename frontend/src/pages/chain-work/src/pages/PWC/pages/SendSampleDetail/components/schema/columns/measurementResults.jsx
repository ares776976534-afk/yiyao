import React from 'react';
import { ITEM_STATUS_TEXT_MAP, ITEM_MEASUR_STATUS_SUCCESS } from '@/pages/PWC/constants';

const NoResult = ({ status }) => {
  const text = ITEM_STATUS_TEXT_MAP[status];
  return (
    <div className="text-[13px] text-[#333] mb-[24px] pt-[12px]">
      {text || '-'}
    </div>
  );
};

const Result = ({ data = {} }) => {
  const { length = '-', width = '-', height = '-', weight = '-' } = data;
  return (
    <div className="text-[13px] text-[#333] mb-[24px] flex flex-col pt-[12px]">
      <span className="mb-[4px]">长：{length} cm</span>
      <span className="mb-[4px]">宽：{width} cm</span>
      <span className="mb-[4px]">高：{height} cm</span>
      <span className="mb-[4px]">重量：{weight} g</span>
    </div>
  );
};

export default ({ record }) => {
  const { dataList = [] } = record;
  const skuData = dataList[0] || {};
  const { measureInfo, measureResult } = skuData;

  return measureResult === ITEM_MEASUR_STATUS_SUCCESS ? <Result data={measureInfo} /> : <NoResult status={measureResult} />;
};
