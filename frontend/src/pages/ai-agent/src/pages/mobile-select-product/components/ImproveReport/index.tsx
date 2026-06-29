import React from 'react';
import { improveAgent } from '../../utils';

function ImproveReport({ data, blocks }: { data: any; blocks: any }) {
  const report = improveAgent(data, blocks);
  console.log(report);
  return (
    <div>
      ImproveReport
    </div>
  );
}

export default ImproveReport;
