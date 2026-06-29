import { useEffect } from 'react';
import styles from './index.module.css';
import { CloseIcon } from '@/components/Icon';
import { $t } from '@/i18n';

interface TypeRiskControlTipsProps {
  visible: boolean;
  onClose: () => void;
  riskMessage?: string;
}

export const RiskControlTips = ({ visible, onClose, riskMessage }: TypeRiskControlTipsProps) => {
  // 1秒后自动消失
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (visible) {
      timer = setTimeout(() => {
        onClose();
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.riskControlTips} onClick={(e) => e.stopPropagation()}>
        <div className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </div>
        <div className={styles.title}>{riskMessage}</div>
      </div>
    </div>
  );
};