import { Popup } from 'antd-mobile';
import styles from './report.module.scss';
import { CloseIcon } from '@/components/Icons';
import { MobileFullScreenIcon, MobileExitFullScreenIcon } from '@/components/Icon';
import { useState } from 'react';

const Report = ({
  visible,
  onMaskClick,
  title,
  children,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onMaskClick}
      bodyStyle={isFullScreen ? {
        height: '100%',
      } : {
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        height: '90%',
      }}
    >
      <div className={styles.report}>
        <div className={styles.header}>
          <div className={styles.iconBtn} onClick={handleToggleFullScreen}>
            {isFullScreen ? <MobileExitFullScreenIcon /> : <MobileFullScreenIcon />}
          </div>
          <div className={styles.title}>{title}</div>
          <div className={styles.closeBtn}>
            <CloseIcon onClick={onMaskClick} size={20} />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>{title}</div>
          {children}
        </div>
      </div>
    </Popup>
  )
}

export default Report;