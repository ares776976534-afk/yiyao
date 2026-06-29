import { useState } from 'react';
import { getVersionComponent } from '@/utils/versionRouter';
import styles from '../index.module.css';
import { Dropdown } from 'antd';
import { CountryIcon, DownArrowIcon } from '@/components/Icon';

const Cn = () => {
  return (
    <></>
  )
}

const Global = ({ items, handleLanguageChange, selectedLanguage }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      menu={{ items, onClick: handleLanguageChange }}
      trigger={['click']}
      overlayClassName="language-dropdown-overlay"
      open={open}
      onOpenChange={setOpen}
    >
      <div className={styles.languageSettingsItem}>
        <CountryIcon color="#1D1E29" width={16} height={16} />
        <div className={styles.languageSettingsItemText}>
          <span>{selectedLanguage?.label}</span>
          <DownArrowIcon className={`${styles.arrowIcon} ${open ? styles.arrowIconRotated : ''}`} />
        </div>
      </div>
    </Dropdown>
  )
}

export default getVersionComponent({
  CN: Cn,
  GLOBAL: Global,
});

