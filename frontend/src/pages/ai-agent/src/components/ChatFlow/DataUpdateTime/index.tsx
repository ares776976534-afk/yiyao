import styles from './index.module.css';
import { $t } from '@/i18n';

export const DataUpdateTime = ({ dataUpdateTime, title }: { dataUpdateTime?: string, title?: string }) => {
  return (
    <div className={styles.dataUpdateTimeContainer}>
      <div className={styles.keywordSummaryTitle} >
        <div className={styles.Icon} />
        <span className={styles.keywordSummaryTitleText}>
          {title}
        </span>
      </div >
      {dataUpdateTime && <div className={styles.dataUpdateTime}>{$t('global-1688-ai-app.ChatFlow.DataUpdateTime.dataUpdateTime', '数据更新时间')}: {dataUpdateTime}</div>}
    </div>
  );
};