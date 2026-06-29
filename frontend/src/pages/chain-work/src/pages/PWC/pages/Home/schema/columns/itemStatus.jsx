import React from 'react';
import StatusLabel from '@/components/StatusLabel';
import { ITEM_STATUS_TEXT_MAP, ITEM_STATUS_TYPE, ITEM_STATUS_PREPARE, ITEM_STATUS_FAIL } from '@/pages/PWC/constants';

export default (value, index, record) => {
  const { measureStatusExtInfo = {}, sendSampleStatusExtInfo = {} } = record;
  const { measureStatus, failReason } = measureStatusExtInfo;
  const type = ITEM_STATUS_TYPE[measureStatus] || 'info';
  const text = ITEM_STATUS_TEXT_MAP[measureStatus] || '-';
  const isPrepare = measureStatus === ITEM_STATUS_PREPARE;
  const isFinished = measureStatus === ITEM_STATUS_FAIL;
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        {
          isPrepare ? '-' : (
            <StatusLabel type={type}>
              {text}
            </StatusLabel>
          )
        }
      </div>
      {failReason && isFinished ? <p className="text-[#666] text-[13px] mt-[6px]">{failReason}</p> : null}
    </div>
  );
};
