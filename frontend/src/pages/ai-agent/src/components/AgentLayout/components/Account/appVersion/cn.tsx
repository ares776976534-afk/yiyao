import React, { useEffect, useState } from 'react';
import { getUserInfo } from '@/utils/login';
import { defaultUserImg } from '@/utils/env';
import { Button } from 'antd';
import styles from './cn.module.css';
import { checkAuthAndLogin } from '@/utils/login';
import { $t } from '@/i18n';
import TitleHeater from '../../Settings/TitleHeater';

interface AccountProps {
  id?: string;
}

const Account: React.FC<AccountProps> = ({ id }) => {
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogin = () => {
    checkAuthAndLogin({
      type: 'mobile',
    }).then((result) => {
      if (result) {
        getUserInfo().then((user) => {
          setUserInfo(user);
        });
      }
    });
  };

  useEffect(() => {
    getUserInfo().then((user) => {
      setUserInfo(user);
    });
  }, []);
  return (
    <div id={id} className={styles.container}>
      <div className={styles.header}>
        {/* <span className={styles.title}>{$t("global-1688-ai-app.AgentLayout.Account.account", "账户")}</span> */}
        <TitleHeater title={$t("global-1688-ai-app.AgentLayout.Account.account", "账户")} />
      </div>

      {
        userInfo ? (
          <>
            <img
              src={defaultUserImg}
              className={styles.avatar}
              alt={$t("global-1688-ai-app.AgentLayout.Account.userAvatar", "用户头像")}
            />
            <div className={styles.userInfo}>
              <span className={styles.label}>User ID</span>
              <span className={styles.value}>{userInfo?.loginId ? decodeURIComponent(userInfo?.loginId) : ''}</span>
            </div>
          </>
        ) : (
          <div className={styles.userInfo}>
            <Button className={styles.loginButton} type="primary" onClick={handleLogin}>{$t("global-1688-ai-app.AgentLayout.Account.login", "登录")}</Button>
          </div>
        )
      }
    </div>
  );
};

export default Account;
