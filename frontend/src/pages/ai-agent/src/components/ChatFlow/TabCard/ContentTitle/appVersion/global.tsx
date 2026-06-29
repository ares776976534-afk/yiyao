import styles from './global.module.css';
import { $t } from '@/i18n';

export interface GlobalProps {
  contentTitle: string;
  oppScore: number;
}

const Global = ({ contentTitle, oppScore }: GlobalProps) => {
  return (
    <div className={styles.global}>
      <div className={styles.global__title}>{contentTitle}:</div>
      <div>
        <span className={styles.global__scoreValue}>{oppScore}</span>
        {/* <span className={styles.global__scoreUnit}>{$t("global-1688-ai-app.ChatFlow.TabCard.f", "分")}</span> */}
      </div>
    </div>
  );
};

export default Global;