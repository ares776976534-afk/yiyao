import styles from './index.module.css';
import { TargetIcon, LogisticsIcon, MegaphoneIcon } from '@/components/Icon';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { useEffect } from 'react';
import { $t } from "@/i18n";

const tabs = [
  { icon: LogisticsIcon, label: $t('global-1688-ai-app.ranking.RankingTabs.product', '全网商品榜'), key: 'product' },
  { icon: TargetIcon, label: $t('global-1688-ai-app.ranking.RankingTabs.opportunity', '机会赛道榜'), key: 'opportunity' },
  { icon: MegaphoneIcon, label: $t('global-1688-ai-app.ranking.RankingTabs.theme', '主题热搜榜 (敬请期待)'), disabled: true },
];

const RankingTabs = ({ id }: { id?: string }) => {
  useEffect(() => {
    log.record(LOG_KEYS.SELECT_PRODUCT_HOME.RANKING.OPPORTUNITY, 'EXP');
    log.record(LOG_KEYS.SELECT_PRODUCT_HOME.RANKING.ALL_ITEM, 'EXP');
  }, []);
  const handleClick = (key?: string) => {
    const logKey = key === 'opportunity'
      ? LOG_KEYS.SELECT_PRODUCT_HOME.RANKING.OPPORTUNITY
      : LOG_KEYS.SELECT_PRODUCT_HOME.RANKING.ALL_ITEM;
    log.record(logKey, 'CLK');
    if (key) {
      window.location.href = `/ranking?activeKey=${key}`;
    }
  };

  return (
    <div className={styles.ranking}>
      <div id={id} className={styles.container}>
        <img className={styles.logo} src="https://img.alicdn.com/imgextra/i2/O1CN01AyETlf1rIWFpzjORL_!!6000000005608-2-tps-139-32.png" alt="logo" />
        <div className={styles.tabs}>
          {tabs.map(({ icon: Icon, label, disabled, key }) => (
            <div 
              key={label} 
              className={disabled ? styles.tabDisabled : styles.tab}
              onClick={() => !disabled && handleClick(key)}
            >
              <Icon />
              <span className={disabled ? styles.tabTextDisabled : undefined}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankingTabs; 
