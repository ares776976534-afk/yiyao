import styles from './index.module.css';
import { imgIcon } from '@/components/ChatFlow/imgIcon';

export const EyeIcon = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className={styles.differenceCardTitleImg}>
        <img
            className={styles.differenceCardTitleImgImg}
            src={imgIcon[5]}
            alt="img"
            onClick={onClick}
        />
    </div>
  );
};