import styles from './usercenterModal.module.css';
import { Layout, Menu } from 'antd';
import { useState } from 'react';
import { AccountIcon, MessageContactIcon, QuestionMarkIcon, ArrowIcon, ModalSettingsIcon } from '@/components/Icon';
import Account from './Account';
import Concat from './Concat';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { logout } from '@/utils/login';
import { $t } from '@/i18n';
import Settings from './Settings';
import IconLogo from '@/pages/select-product/components/LeftComponents/IconLogo';

const { Content, Sider } = Layout;

const items: any[] = [
  {
    key: 'account',
    icon: <AccountIcon />,
    label: (
      <div className={styles.layoutSiderMenuItemLabel}>
        <span>{$t("global-1688-ai-app.AgentLayout.UserCenter.zh", "账号")}</span>
      </div>
    ),
  },
  {
    key: 'user_settings',
    icon: <ModalSettingsIcon />,
    label: (
      <div className={styles.layoutSiderMenuItemLabel}>
        <span>{$t("global-1688-ai-app.AgentLayout.settings", "设置")}</span>
      </div>
    ),
  },
  {
    key: 'contact',
    icon: <MessageContactIcon />,
    label: (
      <div className={styles.layoutSiderMenuItemLabel}>
        <span>{$t("global-1688-ai-app.AgentLayout.UserCenter.contactwm", "联系我们")}</span>
      </div>
    ),
    data: {
      path: '/inquiry',
    },
  },
];
const footerItems = [
  {
    key: 'help',
    icon: <QuestionMarkIcon />,
    label: (
      <div className={styles.layoutSiderMenuItemLabel}>
        <span>{$t("global-1688-ai-app.AgentLayout.UserCenter.helpzx", "帮助中心")}</span>
        <span className={styles.layoutSiderMenuItemArrow}><ArrowIcon color="#CCCCD4" /></span>
      </div>
    ),
    data: {
      path: 'https://alidocs.dingtalk.com/i/nodes/KGZLxjv9VGkoG9YwH0Py1kezV6EDybno?corpId=dingd8e1123006514592&utm_medium=im_card&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_scene=team_space&utm_source=im',
      target: '_blank',
    },
  },
  // {
  //   key: 'logout',
  //   icon: <ExitIcon />,
  //   label: $t("global-1688-ai-app.AgentLayout.UserCenter.exitLogin", "退出登录"),
  // },
];
const NewyuanyuanModal = ({ children, selected }: { children?: React.ReactNode, selected: string }) => {
  const [selectedKeys, setSelectedKeys] = useState(selected || 'account');
  const navigate = useNavigateWithScroll();
  // const [selectedFooterKeys, setSelectedFooterKeys] = useState([]);
  const handleMenuClick = (menuInfo) => {
    const { item = {}, key, keyPath } = menuInfo;
    setSelectedKeys(key);
  };
  const handleFooterMenuClick = (menuInfo) => {
    const { item = {}, keyPath, key } = menuInfo;
    if (key === 'logout') {
      logout();
      return;
    }
    setSelectedKeys(keyPath);
    const { props = {} } = item;
    const { path, target } = props.data || {};
    if (target) {
      window.open(path, target);
    } else {
      navigate(path);
    }
  };
  return (
    <Layout style={{ height: '540px', borderRadius: '16px' }}>
      <Sider
        collapsible
        collapsed={false}
        trigger={null}
        className={styles.layoutSiderContainer}
        width={201}
      >
        <div className={styles.layoutSiderHeader}>
          <IconLogo />
          {/* <img className={styles.layoutSiderHeaderLogo} src="https://img.alicdn.com/imgextra/i3/O1CN01wqU0Qp26ODP5ZJtKX_!!6000000007651-2-tps-133-36.png" alt="" srcSet="" /> */}
        </div>
        <div className={styles.layoutSiderContent}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKeys]}
            items={items.filter(item => !!item)}
            onClick={handleMenuClick}
            className={styles.antdMenu}
          />
          <div className={styles.layoutSiderDivider} />
          <Menu
            mode="inline"
            // selectedKeys={selectedFooterKeys}
            onClick={handleFooterMenuClick}
            items={footerItems}
            className={styles.antdMenu}
          />
        </div>
      </Sider>
      <Layout style={{ borderTopRightRadius: '16px', backgroundColor: '#FFF', borderBottomRightRadius: '16px', padding: 20 }}>
        <Content>
          {
            selectedKeys === 'account' && <Account />
          }
          {
            selectedKeys === 'contact' && <Concat />
          }
          {
            selectedKeys === 'user_settings' && <Settings />
          }
        </Content>
      </Layout>
    </Layout>
  );
};

export default NewyuanyuanModal;