import { useState, useMemo } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import DynamicTable from '../components/DynamicTable';

export default function SalesQuery() {
  const [range, setRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const params = useMemo(() => {
    const p = {};
    if (range?.[0]) p.start_date = range[0].format('YYYY-MM-DD');
    if (range?.[1]) p.end_date = range[1].format('YYYY-MM-DD');
    return p;
  }, [range]);

  return (
    <DynamicTable
      module="sales-by-personnel"
      dataApi="/sales-by-personnel"
      params={params}
      rowKey={(r, i) => `${r.record_date}-${r.personnel_id}-${r.drug_id}-${i}`}
      pagination={{ pageSize: 20 }}
      children={<DatePicker.RangePicker value={range} onChange={setRange} style={{ marginRight: 8 }} />}
    />
  );
}
