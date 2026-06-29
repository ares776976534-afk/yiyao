import styles from './cn.module.css';
import { HeaderLogo } from '@/pages/agent-home';
import { $t } from '@/i18n';

const Cn = () => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <HeaderLogo />
        <div className={styles.headerDivider} />
        <span className={styles.headerText}>
          {$t("global-1688-ai-app.agent-home.kjdssy", "跨境电商生意")}
        </span>
        <span className={styles.headerRightText}>
          Agent 
          <img
            src="https://img.alicdn.com/imgextra/i1/O1CN014h2TyW1ahqg4aUrEp_!!6000000003362-2-tps-232-88.png"
            alt="badge"
            className={styles.headerBadge}
          />
        </span>
      </div>
    </div>
  );
};

export default Cn;