import styles from './index.module.scss';
import { DownArrowIcon } from '@/components/Icon';

export const ReturnHeader = ({
  title = '供应商库',
  rightAction,
}: {
  title?: string;
  rightAction?: React.ReactNode;
}) => {
  const handleReturn = () => {
    history.back();
  };
  return (
    <div className={styles.returnHeader}>
      <div className={styles.returnHeaderTitle}>
        <div className={styles.returnIcon} onClick={handleReturn}>
          <DownArrowIcon fill="#7C7F9A" width={20} height={20} />
        </div>
        <div className={styles.returnHeaderTitleText}>{title}</div>
      </div>
      {rightAction && rightAction}
    </div>
  )
}