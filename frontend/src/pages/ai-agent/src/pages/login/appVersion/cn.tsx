import React, { useEffect } from 'react';
import { definePageConfig } from 'ice';
import Logo from '@/components/Logo';
import Login from '@/components/Login';
import styles from '../index.module.css';
import { $t } from '@/i18n';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.login.login", "登录"),
  spm: {
    spmB: 'login',
  },
});

export default () => {
  useEffect(() => {
    log.record(LOG_KEYS.LOGIN.LOGIN_BUTTON, 'EXP');
  }, []);

  const handleSuccess = () => {
    log.record(LOG_KEYS.LOGIN.LOGIN_BUTTON, 'CLK');
    console.log('success');
  };


  return (
    <div className={styles.login}>
      <div className={styles.loginLogo}>
        <Logo style={{ width: '72px', height: '32px' }} />
      </div>
      <div className={styles.loginContent}>
        <Login
          isModal={false}
          onCancel={() => { }}
          onSuccess={handleSuccess}
          topRedirectUrl
          redirectUrl="https://www.alphashop.cn"
        />
      </div>
    </div>
  );
};