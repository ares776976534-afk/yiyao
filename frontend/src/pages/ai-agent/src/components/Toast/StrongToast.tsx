import React, { useEffect, useState } from 'react';
import { StrongSuccessIcon } from './Iocns';
import styles from './index.module.scss';

interface TypeStrongToastProps {
  content: React.ReactNode;
  duration: number;
  onClose: () => void;
}

const StrongToast: React.FC<TypeStrongToastProps> = ({ content, duration, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className={[styles.strongOverlay, visible ? styles.strongOverlayVisible : ''].join(' ')}>
      <div className={styles.strongBox}>
        <StrongSuccessIcon className={styles.strongIcon} />
        <span className={styles.strongText}>{content}</span>
      </div>
    </div>
  );
};

export default StrongToast;
