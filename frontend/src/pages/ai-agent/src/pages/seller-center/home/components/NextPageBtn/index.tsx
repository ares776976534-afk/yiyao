import { ChevronDownIcon, PauseIcon } from '@/components/Icon';
import styles from './index.module.scss';

interface TypeNextPageBtnProps {
  onClick?: () => void;
}

export default ({ onClick }: TypeNextPageBtnProps) => {
  return (
    <div className={styles.container} >
      <div className={styles.content} onClick={onClick}>
        <PauseIcon width={32} height={32} />
        <ChevronDownIcon />
      </div>
    </div>
  );
};