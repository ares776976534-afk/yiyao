import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Spin } from 'antd';
import { ShoppingCartOutlined, MedicineBoxOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import { get } from '../api/request';

export default function SalesDashboard() {
  const [range, setRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const p = {};
    if (range?.[0]) p.start_date = range[0].format('YYYY-MM-DD');
    if (range?.[1]) p.end_date = range[1].format('YYYY-MM-DD');
    return p;
  }, [range]);

  useEffect(() => {
    setLoading(true);
    get('/sales-chart', params).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [params]);

  if (loading || !data) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const lineConfig = {
    data: data.byDate, xField: 'date', yField: 'qty', smooth: true,
    point: { size: 3 }, tooltip: { channel: 'y', name: '销量' },
    axis: { y: { title: '数量' }, x: { title: '' } }, style: { lineWidth: 2 },
  };

  const columnConfig = {
    data: data.byDrug, xField: 'name', yField: 'qty', colorField: 'name',
    tooltip: { channel: 'y', name: '销量' },
    axis: { x: { title: '', labelAutoRotate: true }, y: { title: '数量' } },
    label: { text: 'qty', position: 'outside' },
  };

  const pieConfig = {
    data: data.byPerson, angleField: 'qty', colorField: 'name',
    radius: 0.8, innerRadius: 0.5,
    label: { text: (d) => `${d.name}\n${d.qty}`, position: 'outside' },
    tooltip: { title: 'name', items: [{ channel: 'y', name: '销量' }] },
    legend: { color: { position: 'bottom', layout: { justifyContent: 'center' } } },
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>销售看板</h2>
        <DatePicker.RangePicker value={range} onChange={setRange} />
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="总销量" value={data.total} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="涉及药品" value={data.totalDrugs} prefix={<MedicineBoxOutlined />} suffix="种" /></Card></Col>
        <Col span={6}><Card><Statistic title="销售人员" value={data.totalPersonnel} prefix={<UserOutlined />} suffix="人" /></Card></Col>
        <Col span={6}><Card><Statistic title="出库记录" value={data.totalRecords} prefix={<FileTextOutlined />} suffix="条" /></Card></Col>
      </Row>

      <Card title="每日销售趋势" style={{ marginBottom: 24 }}>
        <Line {...lineConfig} height={300} />
      </Card>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="药品销量 TOP10"><Column {...columnConfig} height={320} /></Card>
        </Col>
        <Col span={10}>
          <Card title="人员销售占比"><Pie {...pieConfig} height={320} /></Card>
        </Col>
      </Row>
    </div>
  );
}
