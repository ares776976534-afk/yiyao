import styles from './index.module.scss';
import { MobileLogoIcon } from '@/components/Icon';

interface MainHeaderProps {
  content?: string;
}

export default ({ content = '您好，请补充您对于选品的要求，我将为您精确选品' }: MainHeaderProps) => {
  return (
    <div className={styles.mainHeader}>
      <MobileLogoIcon width="63px" height="27px" />
      <div className={styles.mainHeaderContent}>{content}</div>
    </div>
  )
}