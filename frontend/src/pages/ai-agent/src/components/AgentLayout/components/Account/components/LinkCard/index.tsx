import React from 'react';
import styles from './index.module.css';
import { globalMemberAuthPageUrl, globalMemberAPIUrl } from '@/utils/env';
import { getUserInfo } from '@/utils/login';
import { Modal, Button, message } from 'antd';
import { $t } from '@/i18n';
import request from '@/services/httpRequest';

interface LinkCardProps {
  onSuccess?: Function;
  isAuth?: Boolean;
}

const AUTH_MSG_KEY = 'alphashop.ai.1688auth';

const postBindUser = async (oauthCode) => {
  try {
    const result = await request(`${globalMemberAPIUrl}/alphashop.user.auth.bind/1.0/HSF`, {
      method: 'POST',
      headers: {
        'language': window.pageData?.language || 'zh_CN',
        'region': 'alphashop',
        'currency': 'usd',
      },
      body: JSON.stringify({
        data: {
          oauthCode,
        },
      }),
    });
    return result?.data?.data;
  } catch {
    return {
      bindSuccess: false,
    };
  }
};

const listenAuthMsg = (authWindow: Window, onSuccess = () => { }) => {
  window.addEventListener('message', (event) => {
    console.log('收到授权消息:', event);
    if (event.data.type === AUTH_MSG_KEY) {
      const data = event.data.data;
      if (data.close === 'true') {
        authWindow.close();
      }
      if (data.bindCode) {
        postBindUser(data.bindCode).then((result) => {
          if (result.bindSuccess) {
            onSuccess();
          } else {
            message.error('绑定失败，请稍后再试');
          }
          authWindow?.close();
        });
      }
    }
  });
};

const newWinPos = (width, height) => {
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  return `left=${left},top=${top},width=${width},height=${height}`;
};

const toAuth = (onSuccess) => {
  getUserInfo({}).then((user) => {
    if (user) {
      const windowFeatures = newWinPos(800, 800);
      const authWindow = window.open(`${globalMemberAuthPageUrl}?lang=${window.pageData.language || 'zh_CN'}`, 'mozillaWindow', windowFeatures);
      setTimeout(() => {
        authWindow?.postMessage({
          type: AUTH_MSG_KEY,
          data: {
            init: 'true', // 初始化授权窗口
          },
        }, '*');
      }, 1000);

      listenAuthMsg(authWindow, onSuccess);
    }
  });
};

export const LinkCardModal = ({ onSuccess = () => { } }) => {
  let dialog = null;

  const handleAuth = () => {
    toAuth(onSuccess);
    dialog?.destroy();
  };

  dialog = Modal.confirm({
    title: $t('global-1688-ai-app.AgentLayout.Account.linkCardModalTitle', '本次操作需进行1688账号授权'),
    content: <span style={{ color: '#7C7F9A', fontSize: '14px' }}>{$t('global-1688-ai-app.AgentLayout.Account.linkCardModalContent', '账号授权后，即可使用该功能')}</span>,
    icon: null,
    footer: (_) => (
      <>
        <Button onClick={() => dialog?.destroy()}>{$t('global-1688-ai-app.AgentLayout.Account.linkCardModalCancel', '暂不授权')}</Button>
        <Button type="primary" onClick={() => handleAuth()} style={{ backgroundColor: '#6E50FF', borderColor: '#6E50FF' }}>{$t('global-1688-ai-app.AgentLayout.Account.linkCardModalConfirm', '去授权')}</Button>
      </>
    ),
  });
};


const LinkCard: React.FC<LinkCardProps> = ({ onSuccess = () => { }, isAuth = false }) => {
  const handleLink = () => {
    if (isAuth) return;
    toAuth(onSuccess);
  };

  return (
    <div className={styles.linkCard}>
      <div className={styles.contentContainer}>
        <img
          className={styles.icon}
          src="https://img.alicdn.com/imgextra/i1/6000000007744/O1CN01hi0rQ2274oFJgRLLV_!!6000000007744-2-gg_dtc.png"
          alt="1688 icon"
        />
        <div className={styles.textContainer}>
          <span className={styles.title}>1688</span>
          <span className={styles.description}>{$t('global-1688-ai-app.AgentLayout.Account.linkCardDescription', '连接1688账号后，可使用询盘、XX、XX等功能')}</span>
        </div>
      </div>
      <div className={`${styles.linkButton} ${isAuth ? styles.disableLinkButton : ''}`} onClick={handleLink}>
        <span className={styles.linkText}>{isAuth ? $t('global-1688-ai-app.AgentLayout.Account.linkCardButtonLinked', 'Linked') : $t('global-1688-ai-app.AgentLayout.Account.linkCardButton', 'Link')}</span>
      </div>
    </div>
  );
};

export default LinkCard;
