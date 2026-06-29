import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import styles from './index.module.css';
import { $t } from '@/i18n';

const AppMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/seller-center/apikey-management',
      icon: 'https://img.alicdn.com/imgextra/i2/6000000006462/O1CN01VgxI0n1xbeSui0SDB_!!6000000006462-2-gg_dtc.png',
      label: 'API Key'
    },
    {
      key: '/seller-center/credit-management',
      icon: 'https://img.alicdn.com/imgextra/i3/6000000002215/O1CN01p9lPH71SEWNFM2lL9_!!6000000002215-2-gg_dtc.png',
      label: $t("global-1688-ai-app.BaseFramework.Menu.yl", "用量")
    },
    {
      key: '/seller-center/order-management',
      icon: 'https://img.alicdn.com/imgextra/i2/6000000001726/O1CN01Friu101OcYhLCdlIB_!!6000000001726-2-gg_dtc.png',
      label: $t("global-1688-ai-app.BaseFramework.Menu.order", "订单")
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleAccountClick = () => {
    navigate('/account');
  };

  const getSelectedKeys = () => {
    if (location.pathname === '/' || location.pathname === '/api-keys') {
      return ['/api-keys'];
    }
    return [location.pathname];
  };

  const antdMenuItems = menuItems.map(item => ({
    key: item.key,
    icon: <img src={item.icon} alt={item.label} className={styles.menuIcon} />,
    label: item.label,
  }));

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img
              src="https://img.alicdn.com/imgextra/i2/6000000007967/O1CN01VzxRlk28iwXoGhDWx_!!6000000007967-2-gg_dtc.png"
              alt="logo"
              className={styles.logoIcon}
            />
            <span className={styles.logoText}>Alphashop</span>
            <span className={styles.logoSubtext}>{$t("global-1688-ai-app.BaseFramework.Menu.htglzx", "后台管理中心")}</span>
          </div>
        </div>

        <div className={styles.menu}>
          <Menu
            mode="vertical"
            selectedKeys={getSelectedKeys()}
            onClick={handleMenuClick}
            items={antdMenuItems}
            className={styles.customMenu}
          />
        </div>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.divider}></div>
        <div className={styles.accountSection} onClick={handleAccountClick}>
          <img
            src="https://img.alicdn.com/imgextra/i2/6000000005591/O1CN01xa5dSz1rAjUa2gxBI_!!6000000005591-2-gg_dtc.png"
            alt="account"
            className={styles.menuIcon}
          />
          <span className={styles.menuLabel}>{$t("global-1688-ai-app.BaseFramework.Menu.zhgl", "账号管理")}</span>
        </div>
      </div>
    </div>
  );
};

export default AppMenu;