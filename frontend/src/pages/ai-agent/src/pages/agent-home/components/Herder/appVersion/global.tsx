import styles from './global.module.css';
import { $t } from '@/i18n';

const Global = () => {
  return (
    <div className={styles.header}>
      <img className={styles.headerLogo} src="https://img.alicdn.com/imgextra/i4/O1CN01WWPiMg1IT2nadnfJX_!!6000000000893-2-tps-527-72.png" alt="logo" />
      <div className={styles.headerText}>
        {$t("global-1688-ai-app.agent-home.global-kjdssy", "跨境电商生意")}
        <div className={styles.headerBadge}>
          {$t("global-1688-ai-app.agent-home.global-freeNow", "免费试用")}
        </div>
      </div>
    </div>
  );
};

export default Global;