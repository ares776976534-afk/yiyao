import NavBar from '../navBar';
import Drawer from '../drawer';
import { useState, useEffect } from 'react';
import HistoryPopup from '../historyPopup';
import { HistoryIcon, SupplierIcon } from '@/components/Icon';
import styles from './index.module.scss';
import Background from '../background';

interface Props {
  children: React.ReactNode;
  type?: string;
}
const RightIcon = {
  default: <HistoryIcon />,
  supplier: <SupplierIcon fill="var(--icon-primary)" />,
}
export default function Framework({
  children,
  type = 'default',
}: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // 控制 body 滚动（Drawer 或 HistoryPopup 打开时）
  useEffect(() => {
    const shouldLock = open || visible;
    
    if (shouldLock) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复滚动位置
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [open, visible]);

  const onMaskClick = () => {
    setVisible(false)
  }
  const onHistoryClick = () => {
    switch (type) {
      case 'default':
        setVisible(true)
        break;
      case 'supplier':
        location.href = '/mobile/supplier';
        break;
    }
  }

  return (
    <Background>
      <div className={styles.frameworkContainer}>
        <div className={styles.navBarWrapper}>
          <NavBar
            onHandleClick={() => {setOpen(true)}}
            onHistoryClick={onHistoryClick}
            rightIcon={RightIcon[type]}
          />
        </div>
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} />
      <HistoryPopup visible={visible} onMaskClick={onMaskClick} />
    </Background>
  );
}