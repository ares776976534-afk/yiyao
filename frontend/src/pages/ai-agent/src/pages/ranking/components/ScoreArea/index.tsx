import React from 'react';
import styles from './index.module.css';
import { RankingListLeftIcon, RankingListRightIcon } from '@/components/Icon';
import { Popover } from 'antd';
import RadarChartChart from '@/components/ChatFlow/RadarChart/RadarChartChart'
import { $t } from "@/i18n";

interface ScoreAreaProps {
  product: string;
  radarDescription?: string;
  propertyList?: any[];
}
 
const ScoreArea: React.FC<ScoreAreaProps> = ({ product, radarDescription, propertyList }) => {
  return (
    <Popover
      classNames={{
        root: styles.popoverRoot,
      }}
      styles={{ body: { padding: 0 } }}
      placement="bottom"
      trigger="hover"
      open={false}
      content={
        <div className={styles.popoverContent}>
          <div className={styles.popoverContentTitle}>
            <div className={styles.popoverContentTitleText}>机会分:{product}分</div>
            <div className={styles.popoverContentTitleTextDesc}>{radarDescription}</div>
          </div>
          <RadarChartChart data={propertyList || []} />
        </div>
      }
    >
      <div className={styles.scoreArea}>
        <img className={styles.scoreBg} src="https://img.alicdn.com/imgextra/i4/O1CN01WjuNNV29nM0BjJ93K_!!6000000008112-2-tps-120-96.png" />
        <div className={styles.scoreContent}>
          <div className={styles.scoreContentTitle}>{$t('global-1688-ai-app.select-product.RightComponents.ProductReportBoard.jhzs', '机会分')}</div>
          <div className={styles.scoreRow}>
            <div className={styles.scoreRowIcon}><RankingListLeftIcon /></div>
            <span className={styles.scoreNumber}>{product}</span>
            <div className={styles.scoreRowIcon}><RankingListRightIcon /></div>
          </div>
        </div>
      </div>
    </Popover>
  );
};

export default ScoreArea;