import React from 'react';
import { Button } from '@alifd/next';
import { PWC_SEND_URL } from '@/pages/PWC/constants';

export default () => {
  return {
    hasRowSelection: true,
    primaryKey: 'sampleId',
    showSelectTip: false,
    leftAction: (data) => {
      const handleClick = () => {
        const ids = data.checked.map((item) => item.sampleId).join(',');
        window.open(PWC_SEND_URL(ids), '_blank');
      };
      return <Button type="primary" disabled={data.checked.length === 0} onClick={handleClick}>批量寄样</Button>;
    },
  };
};
