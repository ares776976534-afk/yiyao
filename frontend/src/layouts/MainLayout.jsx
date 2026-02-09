import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 360, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
