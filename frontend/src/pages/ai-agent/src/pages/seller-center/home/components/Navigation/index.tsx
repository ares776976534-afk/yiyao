import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import styles from './index.module.scss';
import { checkAuthAndLogin, getUserInfo, logout } from '@/utils/login';
import { Dropdown } from 'antd';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import { defaultUserImg } from '@/utils/env';
import MobileMenu from './mobileMenu';
import { $t } from '@/i18n';
import { useFullpageApi } from '../../index';
import Column from './Column';

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  hasDropdown?: boolean;
  children?: MenuItem[];
  onClick?: () => void;
  path?: string;
  type?: 'link' | 'router';
}

interface NavigationHeaderProps {
  id?: string;
  menuItems?: MenuItem[];
  sticky?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  type?: 'default' | 'simple';
}

const defaultMenuItems: MenuItem[] = [
  {
    key: 'agent',
    label: 'Agent',
    path: '/home',
  },
  {
    key: 'api',
    label: $t("global-1688-ai-app.seller-center.home.Navigation.APIservice", "API服务"),
    path: '/seller-center/home/api-list',
  },
  {
    key: 'mcp',
    label: $t("global-1688-ai-app.seller-center.home.Navigation.MCPservice", "MCP服务"),
    path: '/seller-center/home/mcp-list',
  },
  {
    key: 'docs',
    label: $t("global-1688-ai-app.seller-center.home.Navigation.document", "文档"),
    path: 'https://alidocs.dingtalk.com/i/nodes/KGZLxjv9VGkoG9YwH0Py1kezV6EDybno?corpId=dingd8e1123006514592&utm_medium=im_card&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_scene=team_space&utm_source=im',
    type: 'link',
  },
];

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  id,
  menuItems = defaultMenuItems,
  sticky = true,
  type = 'default',
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigateWithScroll();
  const fullpageApi = useFullpageApi();

  // useEffect(() => {
  //   if (!sticky) return;

  //   const handleScroll = () => {
  //     const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  //     setIsSticky(scrollTop > 0);
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [sticky]);

  const renderMenuItem = (item: MenuItem) => {
    const handleClick = () => {
      if (item.path) {
        if (item.type === 'link') {
          window.open(item.path, '_blank');
        } else {
          navigate(item.path);
        }
      }
    };

    const menuItemContent = (
      <div
        className={styles.menuItemWrapper}
      >
        <div className={styles.menuItem} onClick={handleClick}>
          <span className={styles.navText}>{item.label}</span>
        </div>
      </div>
    );
    if (item.key === 'agent') {
      return (
        <div
          className={styles.menuItemWrapper}
        >
          <div className={styles.menuItem} onClick={handleClick}>
            <span className={styles.navText}>{item.label}</span>
            <img
              className={styles.menuItemIcon}
              src="https://img.alicdn.com/imgextra/i3/O1CN01I3nlx01UAW9zutfNe_!!6000000002477-2-tps-88-34.png"
            />
          </div>
        </div>
      );
    }
    return menuItemContent;
  };

  const onRegisterClick = () => {
    window.open('https://member.1688.com/member/join/common_join.htm?tracelog=change_person_register_20130322', '_blank');
  };

  const onLoginClick = () => {
    checkAuthAndLogin({
      onSuccess: () => {
        window.location.reload();
      },
    })
      .then(() => {
        getUserInfo().then((user) => {
          setUserInfo(user);
        });
      });
  };

  useEffect(() => {
    getUserInfo().then((user) => {
      setUserInfo(user);
    });
  }, []);

  return (
    <div
      className={`${styles.header} ${sticky && isSticky ? styles.sticky : ''}`}
      id="layout-navigation"
    >
      <Logo
        className={styles['logo-nav']}
        onClick={() => {
          if (fullpageApi) {
            fullpageApi.moveTo(1);
          } else {
            navigate('/seller-center/home#page1');
          }
        }}
      />
      <Column type={type} menuItems={menuItems} renderMenuItem={renderMenuItem} />
      {
        userInfo ? (
          <div className={styles.userInfo}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'account',
                    label: <div className={styles.loginoutButton}>{$t("global-1688-ai-app.seller-center.home.Navigation.jrkzt", "进入控制台")}</div>,
                    onClick: () => navigate('/seller-center/apikey-management'),
                  },
                  {
                    key: 'logout',
                    label: <div className={styles.loginoutButton}>{$t("global-1688-ai-app.seller-center.home.Navigation.exitLogin", "退出登录")}</div>,
                    onClick: logout,
                  },
                ],
              }}
            >
              <img className={styles.userInfoAvatar} src={defaultUserImg} alt="userInfo" />
            </Dropdown>
          </div>
        ) : (
          <div className={styles.authSection}>
            <div className={styles.loginButton} onClick={onLoginClick}>{$t("global-1688-ai-app.seller-center.home.Navigation.immediatelyLogin", "立即登录")}</div>
          </div>
        )
      }
      <div className={styles.mobileMenu}>
        <MobileMenu />
      </div>
    </div>
  );
};

export default NavigationHeader;
