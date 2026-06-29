import React, { useState, useEffect } from "react";
import { Dropdown, Button } from "antd";
import type { DropdownProps } from "antd";
import { checkAuthAndLogin, getUserInfo, logout } from "@/utils/login";
import { IconSettings, IconGuide, IconLogout } from "./icons";
import { useStore } from "@/stores/context";
import UserPrefer from "@/components/UserPrefer";
import styles from "./index.module.scss";
import studioDefaults from "@/configs/studioDefaults";
import { $t } from '@/i18n';

interface LoginButtonProps {
  className?: string;
  style?: React.CSSProperties;
  unloginText?: string;
  align?: DropdownProps["align"];
  onLoginSuccess?: () => void;
  onLogoutSuccess?: () => void;
}

export default function LoginButton(props: LoginButtonProps) {
  const {
    className,
    style,
    unloginText,
    align = { offset: [0, 12] }, // 设置默认值
    onLoginSuccess,
    onLogoutSuccess,
  } = props;

  const [userInfo, setUserInfo] = useState<any>(null);
  const [showUserPrefer, setShowUserPrefer] = useState(false);
  const isLogin = !!userInfo?.loginId;

  const store = useStore();

  const _setUserInfo = (_userInfo: any) => {
    store.setUserInfo(_userInfo);
    setUserInfo(_userInfo);
  };

  const handleGetUserInfo = () => {
    return getUserInfo().then((user) => {
      _setUserInfo(user);
    });
  };

  const handleLogin = () => {
    checkAuthAndLogin().then((loginSuccess) => {
      if (loginSuccess) {
        handleGetUserInfo().then(() => {
          onLoginSuccess?.();
        });
      }
    });
  };

  const handleLogout = () => {
    logout();
    _setUserInfo(null);
    onLogoutSuccess?.();
  };

  const handleOpenSettings = () => {
    setShowUserPrefer(true);
  };

  const handleOpenGuide = () => {
    window.open('https://alidocs.dingtalk.com/i/nodes/ZX6GRezwJlzeYoPLF63RwnjyWdqbropQ?cid=450364019%3A5835504270&utm_source=im&utm_scene=team_space&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_medium=im_card&corpId=dingd8e1123006514592', '_blank');
  };

  const handleCloseSettings = () => {
    setShowUserPrefer(false);
  };

  useEffect(() => {
    handleGetUserInfo();

    const handleLogin = (e: CustomEvent) => {
      _setUserInfo(e.detail);
      onLoginSuccess?.();
    };

    addEventListener("setLoginData", handleLogin);

    return () => {
      removeEventListener("setLoginData", handleLogin);
    };
  }, []);

  return (
    <div
      className={`${styles.userInfoContainer}${
        className ? ` ${className}` : ""
      }`}
      style={{ ...style }}
    >
      {isLogin ? (
        <Dropdown
          align={align}
          mouseLeaveDelay={.3}
          menu={{
            className: styles.dropdown,
            items: [
              {
                key: "settings",
                label: (
                  <div className={styles.dropdownItem}>
                    <IconSettings />{$t("global-1688-ai-app.LoginButton.systemSettings", "系统设置")}</div>
                ),
                onClick: handleOpenSettings,
              },
              {
                key: "guide",
                label: (
                  <div className={styles.dropdownItem}>
                    <IconGuide />{$t("global-1688-ai-app.LoginButton.syjc", "使用教程")}</div>
                ),
                onClick: handleOpenGuide,
              },
              {
                key: "logout",
                label: (
                  <div className={styles.dropdownItem}>
                    <IconLogout />{$t("global-1688-ai-app.LoginButton.exitLogin", "退出登录")}</div>
                ),
                onClick: handleLogout,
              },
            ],
          }}
        >
          <div className={styles.userInfoPortal}>
            <img
              className={styles.userImg}
              src={userInfo?.avatar || studioDefaults.userImage}
              alt=""
            />
          </div>
        </Dropdown>
      ) : (
        <div className={styles.unloginPortal}>
          <Button type="primary" onClick={handleLogin}>
            {unloginText || $t("global-1688-ai-app.LoginButton.immediatelyLogin", "立即登录")}
          </Button>
        </div>
      )}

      {/* 用户偏好设置弹窗 */}
      {
        !!showUserPrefer && (
          <UserPrefer visible={showUserPrefer} onClose={handleCloseSettings} />
        )
      }
    </div>
  );
}
