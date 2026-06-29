import React, { useState, useEffect } from 'react';
import { Switch, message } from 'antd';
import styles from './index.module.css';
import { useStore } from '@/stores/context';
import { $t } from '@/i18n';

export const CookieSettingsPanel = ({ onCancel, onSave, style }: { onCancel: () => void; onSave: () => void; style?: React.CSSProperties }) => {
  const store = useStore();
  const { cookieManager } = store.userPrefer;

  const [analyticsEnabled, setAnalyticsEnabled] = useState(cookieManager?.analytics ?? true);

  const handleSave = () => {
    store.userPrefer.updatePreferences({
      ...store.userPrefer.preferences,
      cookieManager: {
        ...store.userPrefer.preferences.cookieManager,
        analytics: analyticsEnabled,
      },
    });
    message.loading($t('global-1688-ai-app.page.prepareReload', '即将刷新页面...'));
    setTimeout(() => {
      onSave();
      window.location.reload();
    }, 500);
  };

  return (
    <div className={styles.settingsPanel} style={style}>
      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <span className={styles.settingTitle}>{$t('global-1688-ai-app.Settings.cookie.essentialCookies', 'Essential cookies')}</span>
          <span className={styles.settingDescription}>
            {$t('global-1688-ai-app.Settings.cookie.essentialCookies.desc', 'Used for core site functions such as security, network management and accessibility. These cannot be disabled')}
          </span>
        </div>
        <Switch disabled checked />
      </div>

      <img className={styles.divider} src="https://img.alicdn.com/imgextra/i4/6000000003412/O1CN01rmn70u1b4kUOjvgNu_!!6000000003412-2-gg_dtc.png" />

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <span className={styles.settingTitle}>{$t('global-1688-ai-app.Settings.cookie.analyticsCookies', 'Analytics cookies')}</span>
          <span className={styles.settingDescription}>{$t('global-1688-ai-app.Settings.cookie.analyticsCookies.desc', 'Help us understand how visitors use our site so we can improve it')}</span>
        </div>
        <Switch
          checked={analyticsEnabled}
          onChange={setAnalyticsEnabled}
        />
      </div>

      <div className={styles.actionButtons}>
        <div className={styles.cancelButton} onClick={onCancel}>
          <span className={styles.cancelText}>{$t("global-1688-ai-app.common.cancel", "取消")}</span>
        </div>
        <div className={styles.saveButton} onClick={handleSave}>
          <span className={styles.saveText}>{$t("global-1688-ai-app.common.save", "保存")}</span>
        </div>
      </div>
    </div>
  );
};

const CookieSettings: React.FC = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const showPanel = () => {
    setIsPanelVisible(true);
  };

  const handleCancel = () => {
    setIsPanelVisible(false);
  };


  return (
    <div className={styles.container}>
      <div className={styles.cookiesCard}>
        <div className={styles.cookiesContent}>
          <div className={styles.cookiesInfo}>
            <span className={styles.cookiesTitle}>Cookies</span>
            <span className={styles.cookiesDescription}>
              <span className={styles.descriptionText}>
                {$t('global-1688-ai-app.Settings.cookie.description', 'You can manage your cookie preferences here at any time. Click the different category headings to learn more and adjust the default settings. Please note that blocking certain types of cookies may affect your experience on the site and the services we can provide.')}
              </span>
              <a className={styles.policyLink} href="https://terms.alicdn.com/legal-agreement/terms/c_end_product_protocol/20251223171117755/20251223171117755.html" target="_blank" rel="noopener noreferrer">Cookies Policy</a>.
            </span>
          </div>
          <div className={styles.manageButton} onClick={showPanel}>
            <span className={styles.manageText}>
              {$t('global-1688-ai-app.Settings.cookie.manage', 'Manage')}
            </span>
          </div>
        </div>
      </div>

      {isPanelVisible && (
        <CookieSettingsPanel
          onCancel={handleCancel}
          onSave={handleCancel}
        />
      )}
    </div>
  );
};

export default CookieSettings;
