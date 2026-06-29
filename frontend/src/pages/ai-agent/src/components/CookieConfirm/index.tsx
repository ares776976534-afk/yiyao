import React, { useState, useEffect } from 'react';
import { appVersionType, AppVersionType } from '@/utils/env';
import { useStore } from '@/stores/context';
import { CookieSettingsPanel } from '@/components/AgentLayout/components/Settings/CookieManager';
import styles from './index.module.css';
import { $t } from '@/i18n';

const COOKIE_PREFERENCE_KEY = 'alphashop.ai.cookiePreference';

interface CookiesModalProps {
  id?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCustomize?: () => void;
}

const CookiesModal: React.FC<CookiesModalProps> = ({
  onAccept,
  onReject,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [panelVisible, setPanelVisible] = useState(false);

  const store = useStore();

  // 设置Cookie并隐藏模态框
  const setCookiePreference = (preference: string) => {
    localStorage.setItem(COOKIE_PREFERENCE_KEY, preference);
    setIsVisible(false);
  };


  const handlePanelCancel = () => {
    setPanelVisible(false);
  };

  const handlePanelSave = () => {
    setIsVisible(false);
    setPanelVisible(false);
    setCookiePreference('accepted');
  };


  const handleSetCookie = (enable) => {
    store.userPrefer.updatePreferences({
      ...store.userPrefer.preferences,
      cookieManager: {
        ...store.userPrefer.preferences.cookieManager,
        analytics: enable,
      },
    });
    setCookiePreference(enable ? 'accepted' : 'rejected');
  };

  // 处理接受所有Cookie
  const handleAcceptAll = () => {
    handleSetCookie(true);
    onAccept?.();
  };

  // 处理拒绝所有Cookie
  const handleRejectAll = () => {
    handleSetCookie(false);
    onReject?.();
  };

  // 处理自定义设置
  const handleCustomize = () => {
    setPanelVisible(true);
  };

  useEffect(() => {
    const cookiePreference = localStorage.getItem(COOKIE_PREFERENCE_KEY);
    if (cookiePreference) {
      setIsVisible(false);
    }
  }, []);

  // 如果不可见，不渲染组件
  if (!isVisible || appVersionType !== AppVersionType.GLOBAL) {
    return null;
  }

  // 检查是否已经设置过Cookie偏好


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <img
            className={styles.icon}
            src="https://img.alicdn.com/imgextra/i3/6000000001990/O1CN01uaQjE41QZTHeDqVZ0_!!6000000001990-2-gg_dtc.png"
            alt="Cookies"
          />
          {/* 专有名词不翻译 */}
          <span className={styles.title}>Cookies</span>
        </div>
        <span className={styles.description}>
          <span className={styles.descriptionText}>
            {$t("global-1688-ai-app.CookieConfirm.description", 'We use cookies to enable, enhance, and analyse site functionality. By clicking "Accept All" you consent to the use of cookies for non-essential purposes and the related processing of personal data. You can manage your cookie preferences at any time via "Settings-Others-Cookies" For more information, please see our {0}')}
          </span>
          <a className={styles.policyLink} href="https://terms.alicdn.com/legal-agreement/terms/c_end_product_protocol/20251223171117755/20251223171117755.html" target="_blank" rel="noopener noreferrer">
            {$t('global-1688-ai-app.CookieConfirm.CookiePolicy', 'Cookies Policy')}
          </a>
        </span>
      </div>
      <div className={styles.buttonGroup}>
        <button
          className={styles.customizeButton}
          onClick={handleCustomize}
          type="button"
        >
          <span className={styles.buttonText}>{$t('global-1688-ai-app.CookieConfirm.Customize', 'Customize')}</span>
        </button>
        <button
          className={styles.rejectButton}
          onClick={handleRejectAll}
          type="button"
        >
          <span className={styles.buttonText}>{$t('global-1688-ai-app.CookieConfirm.RejectAll', 'Reject all')}</span>
        </button>
        <button
          className={styles.acceptButton}
          onClick={handleAcceptAll}
          type="button"
        >
          <span className={styles.acceptButtonText}>{$t('global-1688-ai-app.CookieConfirm.AcceptAll', 'Accept all')}</span>
        </button>
      </div>
      {panelVisible && (
        <CookieSettingsPanel
          onCancel={handlePanelCancel}
          onSave={handlePanelSave}
          style={{ top: '-50px', right: '0px' }}
        />
      )}
    </div>
  );
};

export default CookiesModal;
