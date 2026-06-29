import { NavBar } from 'antd-mobile';
import { MobileLogoIcon, ThreeStripesIcon } from '@/components/Icon';
import LanguageSettings from '@/components/ChatFlow/LanguageSettings';
import styles from './index.module.scss';
import { MobileNavBarConfig } from '@/pages/mobile/config/menuConfig';
import { useState } from 'react';

export interface MobileNavBarProps {
  onHandleClick?: () => void;
  onHistoryClick?: () => void;
  rightIcon?: React.ReactNode;
}

export default ({ onHandleClick, onHistoryClick, rightIcon }: MobileNavBarProps) => {
  const [userInfo, setMobileUserInfo] = useState<any>(null);
  return (
    <NavBar
      back={
        <div className={styles.mobileNavBarLeftIcon}>
          <ThreeStripesIcon width="20" height="20" onClick={onHandleClick} />
          <MobileLogoIcon width="72.16px" height="20px" />
        </div>
      }
      backIcon={false}
      className={styles.mobileNavBar}
      right={
        <div className={styles.mobileNavBarRightIcon}>
          {/* {rightIcon && (
            <div className={styles.mobileNavBarRightIconItem} onClick={onHistoryClick}>
              {rightIcon}
            </div>
          )} */}
          <LanguageSettings setMobileUserInfo={setMobileUserInfo} config={MobileNavBarConfig} type="mobile" overlayClassName="mobile-navbar-dropdown" />
        </div>
      }
    />
  );
};