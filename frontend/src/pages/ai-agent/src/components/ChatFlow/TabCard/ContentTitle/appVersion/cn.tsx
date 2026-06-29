import styles from '../../index.module.css';
import { $t } from '@/i18n';

interface CnProps {
  contentTitle: string;
  oppScore: number;
}
const Cn = ({ contentTitle, oppScore }: CnProps) => {
  return (
    <div className={styles.tabContentTitle}>
      {contentTitle}：
      <span className={styles.tabContentValueUnit}>{oppScore}</span>
      {/* <span className={styles.tabContentValueUnitUnit}>{$t("global-1688-ai-app.ChatFlow.TabCard.f", "分")}</span> */}
    </div>
  );
};

export default Cn;