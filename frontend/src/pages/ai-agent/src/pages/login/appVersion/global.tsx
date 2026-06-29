import React from 'react';
import { definePageConfig } from 'ice';
import Logo from '@/components/Logo';
import Login from '@/components/Login';
import styles from '../index.module.css';
import globalStyles from './global.module.css';
import { $t } from '@/i18n';
import { appBaseUrl } from '@/utils/env';

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.login.login", "登录"),
  spm: {
    spmB: 'login',
  },
});

export default () => {
  const handleSuccess = () => {
    window.location.href = appBaseUrl;
  };


  return (
    <div className={styles.login}>
      <div className={styles.loginLogo}>
        <Logo style={{ width: '72px', height: '32px' }} />
      </div>
      <div className={globalStyles.loginContent}>
        <Login
          isModal={false}
          onCancel={() => { }}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};