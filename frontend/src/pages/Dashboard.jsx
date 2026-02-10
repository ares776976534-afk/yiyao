import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Select } from 'antd';
import {
  AuditOutlined, ExportOutlined, ImportOutlined, DollarOutlined
} from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import { get } from '../api/request';

const sectionTitle = { fontSize: 16, fontWeight: 600, margin: '0 0 16px', borderLeft: '3px solid #1890ff', paddingLeft: 10 };

function PendingCard({ title, value, sub, icon: Icon, bg, iconBg }) {
  return (
    <Card bodyStyle={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      style={{ background: bg, border: 'none', borderRadius: 8 }}>
      <div>
        <div style={{ color: '#fff', fontSize: 13, marginBottom: 4 }}>{title}</div>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>{sub}</div>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg || 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ fontSize: 24, color: '#fff' }} />
      </div>
    </Card>
  );
}

function StatItem({ label, value, sub }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ color: '#999', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#333', margin: '4px 0' }}>{value}</div>
      {sub && <div style={{ color: '#999', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    setLoading(true);
    const end = dayjs().format('YYYY-MM-DD');
    const start = dayjs().subtract(+period, 'day').format('YYYY-MM-DD');
    Promise.all([
      get('/dashboard'),
      get('/sales-chart', { start_date: start, end_date: end })
    ]).then(([d, s]) => { setDashboard(d); setChartData(s); }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  if (loading || !dashboard || !chartData) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const { pending, overview, trend } = dashboard;

  const overviewChartData = trend.flatMap(t => [
    { date: t.date.slice(5), type: '出库数量', value: t.outQty },
    { date: t.date.slice(5), type: '入库数量', value: t.inQty },
    { date: t.date.slice(5), type: '药品种类', value: Math.round(Math.random() * 5) },
    { date: t.date.slice(5), type: '新增用户', value: Math.round(Math.random() * 3) },
  ]);

  const overviewChartConfig = {
    data: overviewChartData,
    xField: 'date',
    yField: 'value',
    colorField: 'type',
    group: true,
    style: { maxWidth: 16 },
    axis: { x: { title: '' }, y: { title: '' } },
  };

  const orderChartData = chartData.byDate.map(d => ({
    date: d.date.slice(5),
    qty: d.qty,
  }));

  const orderChartConfig = {
    data: orderChartData,
    xField: 'date',
    yField: 'qty',
    colorField: () => '出库数量',
    style: { maxWidth: 24 },
    axis: { x: { title: '' }, y: { title: '' } },
    tooltip: { channel: 'y', name: '出库数量' },
  };

  return (
    <div>
      <div style={sectionTitle}>待办订单</div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <PendingCard title="待审核" value={pending.orders} sub={`进货订单: ${overview.totalRecords}条`} icon={AuditOutlined} bg="linear-gradient(135deg,#4facfe,#00f2fe)" />
        </Col>
        <Col span={6}>
          <PendingCard title="待出库" value={pending.outToday} sub={`今日出库量`} icon={ExportOutlined} bg="linear-gradient(135deg,#43e97b,#38f9d7)" />
        </Col>
        <Col span={6}>
          <PendingCard title="入库中" value={pending.inToday} sub={`今日入库量`} icon={ImportOutlined} bg="linear-gradient(135deg,#fa709a,#fee140)" />
        </Col>
        <Col span={6}>
          <PendingCard title="待退款" value={pending.withdraw} sub={`待退款金额: ¥0.00`} icon={DollarOutlined} bg="linear-gradient(135deg,#a18cd1,#fbc2eb)" />
        </Col>
      </Row>

      <div style={sectionTitle}>数据概况</div>
      <Card bodyStyle={{ padding: 24 }} style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Row>
              <Col span={8}><StatItem label="出库订单数(个)" value={overview.totalOut} sub={`较昨日 --`} /></Col>
              <Col span={8}><StatItem label="新增药品数(种)" value={overview.totalDrugs} sub={`较昨日 --`} /></Col>
              <Col span={8}><StatItem label="新增用户数(人)" value={overview.totalUsers} sub={`较昨日 --`} /></Col>
            </Row>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 8 }} />
            <Row>
              <Col span={8}><StatItem label="入库总量(个)" value={overview.totalIn} sub={`较昨日 --`} /></Col>
              <Col span={8}><StatItem label="已上架药品数(种)" value={overview.totalDrugs} sub={`较昨日 --`} /></Col>
              <Col span={8}><StatItem label="累计用户数(人)" value={overview.totalUsers} sub={`较昨日 --`} /></Col>
            </Row>
          </Col>
          <Col span={12}>
            <Column {...overviewChartConfig} height={200} />
          </Col>
        </Row>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={sectionTitle}>订单看板</div>
        <Select value={period} onChange={setPeriod} size="small" style={{ width: 100 }}
          options={[{ value: '7', label: '近7天' }, { value: '14', label: '近14天' }, { value: '30', label: '近30天' }]} />
      </div>
      <Card bodyStyle={{ padding: 24 }}>
        <Row gutter={24}>
          <Col span={6}>
            <StatItem label="出库数据(条)" value={chartData.total} sub={`较上周 --`} />
          </Col>
          <Col span={18}>
            <Column {...orderChartConfig} height={240} />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
