import { LANGUAGE_OPTIONS } from '@/i18n/constants';
import styles from './settings.module.scss';
import { useState } from 'react';
import { DownArrowIcon } from '@/components/Icon';
import MobileActionSheet from '@/pages/mobile/components/mobileActionSheet';

const MobileSettings = () => {
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);

  const handleClick = () => {
    setVisible(true);
  };
  const handleSelect = (option: any) => {
    setLanguage(option);
    setVisible(false)
  };

  return (
    <div>
      <div className={styles.settingsLanguage} onClick={handleClick}>
        <div className={styles.settingsLanguageLabel}>系统语言</div>
        <div className={styles.settingsLanguageValue}>
            <div className={styles.settingsLanguageValueText}>{language.label}</div>
            <DownArrowIcon width="16px" height="16px" />
        </div>
      </div>
      <MobileActionSheet
        visible={visible}
        onClose={() => setVisible(false)}
        languageOptions={LANGUAGE_OPTIONS}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default MobileSettings;