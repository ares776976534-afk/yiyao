import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { Select } from 'antd';
import { $t } from '@/i18n';
import { LANG_MAPPING, LANGUAGE_OPTIONS } from "@/i18n/constants";
import { useStore } from '@/stores/context';
import CookieManager from './CookieManager';
import TitleHeater from './TitleHeater';
import { DownArrowIcon } from '@/components/Icon';

const Settings = () => {
  const store = useStore();
  const { preferences } = store.userPrefer;
  const [language, setLanguage] = useState(preferences.common.language);


  const handleLanguageChange = (value: string) => {
    store.userPrefer.updateLanguage(value as keyof typeof LANG_MAPPING);
  };

  useEffect(() => {
    setLanguage(preferences.common.language);
  }, [preferences]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TitleHeater title={$t("global-1688-ai-app.AgentLayout.settings", "设置")} />
      </div>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>{$t('global-1688-ai-app.AgentLayout.Settings.language', '语言')}</span>
        <div className={styles.settingsItems}>
          <div className={styles.settingsItem}>{$t("global-1688-ai-app.AgentLayout.Settings.systemyy", "系统语言")}</div>
          <Select
            defaultValue={language}
            // defaultValue={'zh_CN'}
            className={styles.settingsItemSelect}
            popupClassName={styles.settingsSelectDropdown}
            options={LANGUAGE_OPTIONS}
            onChange={handleLanguageChange}
            suffixIcon={<DownArrowIcon />}
          />
        </div>
      </div>
      {/* <div className={styles.settingsContent}>
        <div className={styles.settingsItemContent}>
            <div className={styles.settingsItemContentTitle}>接收独家内容</div>
            <div className={styles.settingsItemContentDescription}>获取独家优惠、活动更新、优秀案例示例和新功能指南。</div>
        </div>
        <Switch defaultChecked className={styles.settingsItemSwitch} />
      </div> */}
      <div className={styles.section}>
        <span className={styles.sectionTitle}>{$t('global-1688-ai-app.AgentLayout.Settings.others', '其它')}</span>
        <CookieManager />
      </div>
    </div>
  );
};

export default Settings;