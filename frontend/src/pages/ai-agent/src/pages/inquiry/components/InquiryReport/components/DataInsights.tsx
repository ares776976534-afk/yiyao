import { Card } from 'antd';
import styles from './DataInsights.module.css';
import { $t } from '@/i18n';

interface TypeDataInsightsProps {
  cnKey: string;
  value: string;
}

function DataInsights({ data = [] }: { data?: TypeDataInsightsProps[] }) {
  return (
    <div className={styles.dataInsights}>
      <div className={styles.header}>
        <div className={styles.headerAccent} />
        <h2 className={styles.headerTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.DataInsights.datadc", "数据洞察")}</h2>
      </div>

      <div className={styles.metricsGrid}>
        {data?.map((metric, index) => (
          <Card key={index} className={styles.metricCard} size="small">
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>{metric.cnKey}</span>
              <span className={styles.metricValue}>{metric.value}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DataInsights;