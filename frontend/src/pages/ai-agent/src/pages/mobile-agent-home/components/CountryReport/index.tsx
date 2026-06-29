import React from 'react';
import { countryAgent } from '../../utils';

function CountryReport({ data, blocks }: { data: any; blocks: any }) {
  const report = countryAgent(data, blocks);
  console.log(report);
  return (
    <div>
      CountryReport
    </div>
  );
}

export default CountryReport;
