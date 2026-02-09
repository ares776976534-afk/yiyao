import { Space } from 'antd';

export default function PageHeader({ title, extra }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
        {extra}
      </Space>
    </div>
  );
}
