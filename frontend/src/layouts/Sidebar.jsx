import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { menuConfig } from '../router/menu';

const { Sider } = Layout;

function buildMenuItems(items, navigate) {
  return items.map(item => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon ? <item.icon /> : null,
        label: item.label,
        children: item.children.map(c => ({
          key: c.key,
          label: c.label,
          onClick: () => navigate(c.key)
        }))
      };
    }
    return {
      key: item.key,
      icon: item.icon ? <item.icon /> : null,
      label: item.label,
      onClick: () => navigate(item.key)
    };
  });
}

function getSelectedKeys(pathname) {
  const keys = [];
  for (const item of menuConfig) {
    if (item.children) {
      for (const c of item.children) {
        if (pathname === c.key) {
          keys.push(c.key);
          keys.push(item.key);
        }
      }
    } else if (item.key === pathname) {
      keys.push(item.key);
    }
  }
  return keys.length ? keys : [pathname];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || '/';

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark" width={220}>
      <div style={{ height: 48, margin: 16, color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: '48px', textAlign: 'center' }}>
        医药后台
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys(pathname)}
        defaultOpenKeys={['merchant', 'franchisee', 'mall', 'lottery', 'settings']}
        items={buildMenuItems(menuConfig, navigate)}
        style={{ height: 'calc(100vh - 80px)', borderRight: 0 }}
      />
    </Sider>
  );
}
