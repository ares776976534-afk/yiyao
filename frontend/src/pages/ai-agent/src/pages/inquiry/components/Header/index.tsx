import { useNavigate } from 'ice';
import { Button } from 'antd';
import { ReturnArrowIcon } from '@/components/Icon';
import styles from './index.module.css';
import { $t } from '@/i18n';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  backUrl?: string;
}

function Header({
  title = $t("global-1688-ai-app.inquiry.Header.xpbg", "询盘报告"),
  onBack,
  backUrl,
}: HeaderProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
    onBack?.();
  };
  return (
    <div className={styles.header}>
      <div className={styles.backIcon} onClick={handleBack}>
        <ReturnArrowIcon />
      </div>
      <div className={styles.titleContainer}>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.placeholder} />
    </div>
  );
}

export default Header;