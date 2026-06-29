import React, { useEffect, useState, useRef } from 'react';
import { globalMemberAPIUrl } from '@/utils/env';
import request from '@/services/httpRequest';
import loadScript from '@/utils/loadScript';
import { message } from 'antd';
import styles from './google.module.css';
import { $t } from '@/i18n';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (options: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const getFlowResult = async ({
  clientNode = 'google_user_auth',
  ...params
}) => {
  try {
    const result = await request(`${globalMemberAPIUrl}/alphashop.user.login.run/1.0/HSF`, {
      method: 'POST',
      headers: {
        'language': window.pageData?.language || 'zh_CN',
        'region': 'alphashop',
        'currency': 'usd',
      },
      body: JSON.stringify({
        data: {
          loginType: 3,
          clientNode,
          ...params,
        },
      }),
    });
    return result;
  } catch (error) {
    return null;
  }
};

export default function Google({ onSuccess }: { onSuccess: (res: any) => void }) {
  const flowInstanceIdRef = useRef<string | null>(null);
  const clientNodeRef = useRef<string | undefined>(undefined);

  const handleSuccess = (res) => {
    const {
      credential,
    } = res;

    getFlowResult({
      flowInstanceId: flowInstanceIdRef.current,
      authToken: credential,
      clientNode: clientNodeRef.current,
    }).then((tokenReuslt) => {
      const { data: tokenResultData = {} } = tokenReuslt;
      const { data = {} } = tokenResultData;
      const {
        token,
        refreshToken,
      } = data;
      if (token && refreshToken) {
        onSuccess?.(data);
      } else {
        message.error(data.message || '登录失败');
      }
    });
  };

  const initGoolgeLogin = () => {
    window.google.accounts.id.initialize({
      client_id: "160455992710-s5bcrjc5o1m3q833nvn2rprib1j9bp33.apps.googleusercontent.com",
      ux_mode: 'popup',
      callback: handleSuccess,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("goole-login") as HTMLElement,
      { theme: "outline", size: "large", width: '268px' }, // customization attributes
    );
    // 弹出谷歌自带的登录框
    // window.google.accounts.id.prompt(); // also display the One Tap dialog
    getFlowResult({
      clientNode: 'google_user_auth',
    }).then((res) => {
      const {
        data: resData = {},
      } = res;
      const {
        data = {},
        success,
      } = resData;
      if (success) {
        const {
          flowInstanceId,
          nextNode,
        } = data;
        flowInstanceIdRef.current = flowInstanceId;
        clientNodeRef.current = nextNode;
      } else {
        message.error(data.message || '登录失败');
      }
    });
  };

  useEffect(() => {
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        initGoolgeLogin();
      });
  }, []);

  return (
    <div className={styles.button}>
      <div className={styles.googleIcon}>
        <img src="https://img.alicdn.com/imgextra/i4/O1CN01390Tal1LnbQNplZsJ_!!6000000001344-2-tps-36-36.png" alt="Google" />
      </div>
      <div className={styles.buttonText}>
        {$t('global-1688-ai-app.Login.continueWithGoogle', '使用Google继续')}
      </div>
      <div id="goole-login" className={styles.renderButton} />
    </div>
  );
}