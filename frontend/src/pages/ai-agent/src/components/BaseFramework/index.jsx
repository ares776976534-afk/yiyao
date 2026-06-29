import React, { useEffect } from 'react';
import AppHeader from './Header';
import AppContent from './Content';
import styles from './index.module.css';
import { checkAuthAndLogin } from '@/utils/login';
import { ConfigProvider } from 'antd';
import AgentLayout from '@/components/AgentLayout';
import { ApiKeyIcon, CreditManagementIcon, ShopOrderIcon, PointsExchangeIcon, SettingsIcon } from '@/components/Icon';
import { $t } from '@/i18n';

const menuItems = [
  {
    key: 'agent-home',
    icon: <ApiKeyIcon />,
    label: (
      <div className={styles.menuItemLabel}>
        <span>API Key</span>
      </div>
    ),
    data: {
      path: '/seller-center/apikey-management',
    },
  },
  {
    key: 'credit-management',
    icon: <CreditManagementIcon />,
    label: (
      <div className={styles.menuItemLabel}>
        <span>{$t("global-1688-ai-app.BaseFramework.yl", "用量")}</span>
      </div>
    ),
    data: {
      path: '/seller-center/credit-management',
    },
  },
  {
    key: 'order-management',
    icon: <ShopOrderIcon />,
    label: (
      <div className={styles.menuItemLabel}>
        <span>{$t("global-1688-ai-app.BaseFramework.order", "订单")}</span>
      </div>
    ),
    data: {
      path: '/seller-center/order-management',
    },
  },
  {
    key: 'points-exchange',
    icon: <PointsExchangeIcon />,
    label: (
      <div className={styles.menuItemLabel}>
        <span>{$t("global-1688-ai-app.BaseFramework.pointsExchange", "积分兑换")}</span>
      </div>
    ),
    data: {
      path: '/seller-center/points-exchange',
    },
  },
];

const footerMenuItems = [
  {
    key: 'settings',
    label: $t("global-1688-ai-app.BaseFramework.settings", "设置"),
    icon: <SettingsIcon />,
  },
];

const Framework = ({ title, children, right, theme }) => {
  useEffect(() => {
    checkAuthAndLogin();
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <AgentLayout
        menuItems={menuItems}
        footerMenuItems={footerMenuItems}
        checkAccessPermission={false}
        showUserInfo={false}
        indexPage="/seller-center/apikey-management"
      >
        <div className={styles.main}>
          <AppHeader title={title} right={right} />
          <AppContent>
            {children}
          </AppContent>
        </div>
      </AgentLayout>
      {/* <div className={styles.layout}>
        <AppMenu />

      </div> */}
    </ConfigProvider>
  );
};

export default Framework;