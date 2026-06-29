import React from 'react';
import { getReportRenderer, renderReport } from './ReportRenderer';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const ReportBoard: React.FC<{
  cardId?: string;
  cardType?: string;
  cardSubType?: string;
  formatBlocks: any[];
  onActionClick?: (action: string, data: any) => void;
  reportTime?: string;
}> = (props) => {
  const { formatBlocks, cardId, cardType, cardSubType, onActionClick, reportTime } = props;
  // console.log('formatBlocks', formatBlocks);

  return (
    <div
      data-card-id={cardId}
      data-card-type={cardType}
      data-card-sub-type={cardSubType}
      className={styles.reportBoardContainer}
    >
      {
        (formatBlocks || []).map((block, index) => {
          if (!getReportRenderer(block)) {
            return null;
          }
          return (
            <div key={block.cardId + index} className={styles.reportBoardItem}>
              {
                block.title &&
                (
                  block.cardType === 'IMAGE_SEARCH_SUMMARY' ? (
                    <div className={styles.dataUpdateTimeContainer}>
                      <div className={styles.header}>
                        <div className={styles.indicator} />
                        <span className={styles.title}>{block.title}</span>
                      </div>
                      {reportTime && <div className={styles.dataUpdateTime}>{$t('global-1688-ai-app.ChatFlow.DataUpdateTime.dataUpdateTime', '数据更新时间')}: {reportTime}</div>}
                    </div>
                  ) : (
                    <div className={styles.header}>
                      <div className={styles.indicator} />
                      <span className={styles.title}>{block.title}</span>
                    </div>
                  )                  
                )
              }
              {renderReport({ ...block, onActionClick })}
            </div>
          );
        }) 
      }
    </div>
  );
};

export default ReportBoard;
