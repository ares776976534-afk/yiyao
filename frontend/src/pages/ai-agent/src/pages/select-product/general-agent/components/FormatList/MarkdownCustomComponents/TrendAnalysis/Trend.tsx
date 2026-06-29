import React from 'react';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import styles from './trend.module.css';
import { $t } from '@/i18n';

interface TrendData {
  region: string;
  amazonTrendData: any;
}

interface TrendProps {
  data?: TrendData;
}

const Trend: React.FC<TrendProps> = ({
  data = {} }) => {
  return (
    <div className={styles.content}>
      <div className={styles.contentInner}>
        <div className={styles.googleTrendsHeader}>
          <img
            className={styles.googleIcon}
            src="https://img.alicdn.com/imgextra/i3/O1CN01ybyGlr1Sxra9oCFYW_!!6000000002314-2-tps-24-24.png"
            alt="amazon"
          />
          <span className={styles.googleTrendsText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.TrendAnalysis.Trend.ymx", "亚马逊")}</span>
        </div>
        <div className={styles.dataSection}>
          <div className={styles.leftSection}>
            {/* <div className={styles.dataItem}>
              <div className={styles.dataLabel}>
                <span className={styles.labelText}>平台</span>
              </div>
              <div className={styles.dataValue}>
                <span className={styles.valueText}>{data.platform}</span>
              </div>
            </div> */}
            <div className={styles.dataItem}>
              <div className={styles.dataLabel}>
                <span className={styles.labelText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.TrendAnalysis.Trend.gjregion", "国家&地区")}</span>
              </div>
              <div className={styles.dataValue}>
                <span className={styles.valueText}>{data?.region}</span>
              </div>
            </div>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.chartLabel}>
              <span className={styles.labelText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.TrendAnalysis.Trend.joel", "近12个月搜索量趋势")}</span>
            </div>
            <LineChart data={data?.amazonTrendData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trend;
