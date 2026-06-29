import React, { type FC } from 'react';
import LineChart from '@/components/ChatFlow/LineChart';
import { TypeTableHeader } from '../../types';

interface TrendLineProps {
  value: any[];
  header: TypeTableHeader;

}
const TrendLine: FC<TrendLineProps> = (props) => {
  const { value, header } = props;
  const { pointName, title, isBiggerHigher } = header?.properties || {};

  return (
    <div>
      <LineChart
        toolTipYName={pointName}
        title={title}
        data={value}
        reflect={isBiggerHigher}
      />
    </div>
  );
};

export default TrendLine;
