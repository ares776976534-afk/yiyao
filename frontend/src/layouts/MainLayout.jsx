import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Layout style={{ overflow: 'hidden' }}>
        <Content style={{ padding: 24, background: '#f0f2f5', overflow: 'auto' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 360, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
