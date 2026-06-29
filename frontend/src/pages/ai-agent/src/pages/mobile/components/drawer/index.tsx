import React, { useMemo, useState } from 'react';
import { Drawer, Menu } from 'antd';
import styles from './index.module.scss';
import { MobileLogoIcon, MobileFoldUpIcon, DownArrowIcon } from '@/components/Icon';
import { MobileMenuConfig, MobileFooterConfig } from '@/pages/mobile/config';
import MobileActionSheet from '../mobileActionSheet';
import { LANGUAGE_OPTIONS } from '@/i18n/constants';
import MobileModal from '../mobileModal';

const App: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);
  const [selected, setSelected] = useState('account');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onClick = (e) => {
    switch (e.key) {
      case 'settings':
        setIsModalOpen(true);
        onClose && onClose();
        setSelected(e.key);
        break;
      case 'home':
        location.href = `/mobile/home`;
      break;
      case 'insight':
        location.href = `/mobile/insight`;
      break;
      case 'sourcing':
        location.href = `/mobile/sourcing`;
      break;
      case 'inquiry':
        location.href = `/mobile/inquiry`;
      break;
      case 'chat':
        location.href = `/mobile/chat`;
        break;
      case 'design':
        location.href = `/mobile/material`;
      break;
      default:
        break;
    }
  };
  const handleSelect = (option: any) => {
    setLanguage(option);
    setVisible(false);
  };
  const mobileFooterConfig = useMemo(() => {
    return MobileFooterConfig.map(item => {
      switch (item.key) {
        case 'language':
          return {
            ...item,
            label: (
              <div className={styles.mobileFooterItemLabel} onClick={() => setVisible(true)}>
                <div>语言：{language.label}</div>
                <DownArrowIcon width="12px" height="12px" />
              </div>
            ),
          };
        default:
          break;
      }
      return item;
    });
  }, [language]);
  return (
    <Drawer
      onClose={onClose}
      open={open}
      closable={false}
      placement="left"
      width={250}
      className={styles.drawer}
    >
      <div className={styles.mobileDrawerContent}>
        <div className={styles.mobileMenu}>
          <div className={styles.mobileLogo}>
            <MobileLogoIcon width="72.16px" height="20px" />
            <MobileFoldUpIcon onClick={onClose} fill={'#7C7F9A'} />
          </div>
          <Menu
            onClick={onClick}
            style={{ width: 250 }}
            mode="inline"
            items={MobileMenuConfig as any}
          />
        </div>
        <div className={styles.mobileFooter}>
          <Menu
            onClick={onClick}
            style={{ width: 250 }}
            mode="inline"
            items={mobileFooterConfig as any}
          />
        </div>
      </div>
      <MobileActionSheet
        visible={visible}
        onClose={() => setVisible(false)}
        languageOptions={LANGUAGE_OPTIONS}
        onSelect={handleSelect}
      />
      <MobileModal
        selected={selected}
        isModalOpen={isModalOpen}
        handleCancel={() => setIsModalOpen(false)}
      />
    </Drawer>
  );
};

export default App;