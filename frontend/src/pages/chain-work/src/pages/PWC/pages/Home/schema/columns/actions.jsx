import React from 'react';
import { Button } from '@alifd/next';
import { STATUS_WAITING, STATUS_SEND, ITEM_STATUS_OVER, ITEM_STATUS_FAIL, ITEM_STATUS_MEASURING, PWC_SEND_URL } from '@/pages/PWC/constants';

export default (value, index, record) => {
  const { status, measureStatusExtInfo, relateId = [], sampleId } = record;
  const { measureStatus } = measureStatusExtInfo || {};

  let _status = status;

  if ([STATUS_WAITING, STATUS_SEND].indexOf(_status) === -1) {
    _status = measureStatus;
  }

  if ([ITEM_STATUS_OVER, ITEM_STATUS_FAIL].indexOf(measureStatus) > -1) {
    _status = measureStatus;
  }

  const handleClick = () => {
    const sampleIds = relateId.join(',') || sampleId;
    window.open(PWC_SEND_URL(sampleIds), '_blank');
  };

  const Comp = () => {
    switch (_status) {
      case STATUS_WAITING:
        return <Button type="primary" onClick={handleClick}>去寄样</Button>;
      case STATUS_SEND:
      case ITEM_STATUS_MEASURING:
        return <Button text type="primary" onClick={handleClick}>查看寄样信息</Button>;
      case ITEM_STATUS_OVER:
      case ITEM_STATUS_FAIL:
        return <Button text type="primary" onClick={handleClick}>查看认证结果</Button>;
      default:
        return null;
    }
  };
  return (
    <div>
      <Comp />
    </div>
  );
};
