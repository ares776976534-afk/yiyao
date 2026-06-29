import React from 'react';
import { Modal } from 'antd';
import styles from '../index.module.scss';
import globalStyles from './global.module.css';
import Google from './Google';
import { setToken, setRefreshToken } from '@/utils/bearerTokenHelper';
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

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  isModal = true,
}) => {
  const handleGoogleLoginSuccess = (res: any) => {
    setToken(res.token);
    setRefreshToken(res.refreshToken);
    onSuccess?.(res);
  };

  // 登录页面
  const LoginFrame = () => {
    return (
      <div className={globalStyles.container}>
        <div className={globalStyles.content}>
          <div className={globalStyles.mainSection}>
            <div className={globalStyles.logoSection}>
              <div className={globalStyles.logoContainer}>
                <div className={globalStyles.logoRow}>
                  <img
                    className={globalStyles.logoIcon}
                    src="https://img.alicdn.com/imgextra/i1/6000000000677/O1CN01l4hsuH1Gs7FRX2NgY_!!6000000000677-2-gg_dtc.png"
                    alt="Logo"
                  />
                  <img
                    className={globalStyles.logoText}
                    src="https://img.alicdn.com/imgextra/i4/6000000006309/O1CN01f2fvxs1wTZtBq3zNC_!!6000000006309-2-gg_dtc.png"
                    alt="AlphaShop.ai"
                  />
                </div>
              </div>
              <span className={globalStyles.welcomeText}>
                {$t('global-1688-ai-app.Login.welcome', '欢迎使用遨虾')}
              </span>
            </div>
            <div className={globalStyles.signInButton}>
              <Google onSuccess={handleGoogleLoginSuccess} />
            </div>
          </div>
          <span className={globalStyles.termsText}>
            <span className={globalStyles.termsGray}>{$t('global-1688-ai-app.Login.byContinuingYouAgreeToThe', '登录即代表同意')}</span>
            <span className={globalStyles.termsLink}>
              <a href="https://terms.alicdn.com/legal-agreement/terms/c_end_product_protocol/20251223173249683/20251223173249683.html" target="_blank">
                {$t('global-1688-ai-app.Login.termsOfUse', '《用户协议》')}
              </a>
            </span>
            <span className={globalStyles.termsLink}>
              <a href="https://terms.alicdn.com/legal-agreement/terms/c_end_product_protocol/20251223180950811/20251223180950811.html" target="_blank">
                {$t('global-1688-ai-app.Login.privacyPolicy', '《隐私政策》')}
              </a>
            </span>
          </span>
        </div>
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
            width={360}
            // height={540}
            centered
            destroyOnHidden
            maskClosable={false}
            className={styles.loginModal}
            title={null}
          >
            <LoginFrame />
          </Modal>
        ) : (
          <div className={globalStyles.iframeWrapper}>
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
