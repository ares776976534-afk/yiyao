import React, { useEffect, useRef, useState } from 'react';
import { Modal, Spin } from 'antd';
import { serviceBaseUrl1688 } from '@/utils/env';
import { getLoginPageUrl, hideLoginModal, getUserInfo } from '@/utils/login';
import styles from '../index.module.scss';
import { $t } from '@/i18n';

interface LoginModalProps {
  visible?: boolean;
  initialLoginUrl?: string;
  getCookieUrl?: () => Promise<string>;
  onCancel?: () => void;
  onSuccess?: (event: MessageEvent) => void;
  isModal?: boolean;
  topRedirectUrl?: boolean;
  redirectUrl?: string;
}

enum LoginMessageType {
  LOGIN_SUCCESS = '_sys_pop_login_success_cb_20141106',
  AGENT_LOGIN_SUCCESS = '_sys_pop_agent_login_success_cb_20141106',
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  initialLoginUrl,
  onCancel,
  onSuccess,
  isModal = true,
  topRedirectUrl = false,
  redirectUrl,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loginUrl, setLoginUrl] = useState(initialLoginUrl);

  // 当initialLoginUrl变化时更新loginUrl
  useEffect(() => {
    getLoginPageUrl(redirectUrl || '', topRedirectUrl)
      .then((url) => {
        setLoginUrl(url);
      });
  }, []);

  useEffect(() => {
    // 监听postMessage
    const handleMessage = async (event: MessageEvent) => {
      console.log('handleMessage', event);

      if (event.origin !== 'https://login.1688.com') {
        console.warn('Received message from untrusted origin:', event.origin);
        return;
      }

      if (event.data === LoginMessageType.LOGIN_SUCCESS) {
        // 必须使用1688.com的域名种cookie
        setLoginUrl(`${serviceBaseUrl1688}/tbpass/jump`);
      }
    };

    const handleAgentLoginSuccess = (event: MessageEvent) => {
      if (event.data === LoginMessageType.AGENT_LOGIN_SUCCESS) {
        onSuccess?.(event);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('message', handleAgentLoginSuccess);

    // 清理函数
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('message', handleAgentLoginSuccess);
    };
  }, [onSuccess]);

  useEffect(() => {
    const handleVisibilityChange = async (event: MessageEvent) => {
      if (!document.hidden) {
        try {
          const userInfo = await getUserInfo({ refresh: true });
          if (userInfo) {
            onSuccess?.(event);
            hideLoginModal();
          }
        } catch (error) {
          console.error('检查登录态失败:', error);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onSuccess]);

  // iframe加载完成后的处理
  const handleIframeLoad = () => {
    // 可以在这里发送初始消息给iframe
    // iframeRef.current?.contentWindow?.postMessage({ type: 'INIT' }, '*');
  };

  // iframe加载错误处理
  const handleIframeError = () => {
    console.error('登录页面加载失败');
  };

  // 登录页面
  const LoginFrame = () => {
    return loginUrl ? (
      <iframe
        ref={iframeRef}
        src={loginUrl}
        className={styles.loginIframe}
        title={$t("global-1688-ai-app.Login.login", "登录")}
        frameBorder="0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation allow-top-navigation allow-popups-to-escape-sandbox"
      />
    ) : (
      <div className={styles.loadingWrapper}>
        <Spin tip={$t("global-1688-ai-app.Login.zdoa", "正在加载登录页面...")} />
      </div>
    );
  };

  return (
    <>
      {
        isModal ? (
          <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={840}
            height={540}
            centered
            destroyOnHidden
            maskClosable={false}
            className={styles.loginModal}
            title={null}
          >
            <div className={styles.iframeWrapper}>
              {/* <div className={styles.loginBgWrapper}>
                <img src="https://gw.alicdn.com/imgextra/i4/O1CN010KgP2I1pt2arERWjX_!!6000000005417-0-tps-840-1080.jpg" className={styles.loginBg} />
              </div> */}
              <LoginFrame />
            </div>
          </Modal>
        ) : (
          <div className={styles.iframeWrapper}>
            {/* <div className={styles.loginBgWrapper}>
              <img src="https://gw.alicdn.com/imgextra/i4/O1CN010KgP2I1pt2arERWjX_!!6000000005417-0-tps-840-1080.jpg" className={styles.loginBg} />
            </div> */}
            <LoginFrame />
          </div>
        )
      }
    </>
  );
};

export default LoginModal;
