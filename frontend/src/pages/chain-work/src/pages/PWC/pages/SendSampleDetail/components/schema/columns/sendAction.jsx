import React from 'react';
import { Button } from '@alifd/next';
import { CANCEL_MERGE, PRINT_LABEL, STATUS_WAITING } from '@/pages/PWC/constants';

const Print = ({ onCellAction }) => {
  const handleClick = () => {
    onCellAction(PRINT_LABEL);
  };
  return <Button type="primary" onClick={handleClick}>打印</Button>;
};

const CancelMerge = ({ onCellAction }) => {
  const handleClick = () => {
    onCellAction(CANCEL_MERGE);
  };

  return <Button onClick={handleClick}>取消合并</Button>;
};

export default ({ record, onCellAction }) => {
  const { dataList = [], status } = record;
  const isWaiting = status === STATUS_WAITING;
  return (
    <div className="flex flex-row justify-end pt-[8px] pb-[0]">
      <div className="mr-[4px]">
        {(dataList.length > 1 && isWaiting) && <CancelMerge record={record} onCellAction={onCellAction} />}
      </div>
      <Print record={record} onCellAction={onCellAction} />
    </div>
  );
};
