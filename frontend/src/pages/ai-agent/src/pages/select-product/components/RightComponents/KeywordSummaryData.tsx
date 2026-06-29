import styles from './keywordSummaryData.module.css';
import { Markdown } from '@/components/ChatFlow/Markdown';
import style from '../ImproveComponents/commentInfo.module.css';
import { FailureIcon } from '@/components/Icon';
import { DataUpdateTime } from '@/components/ChatFlow/DataUpdateTime';

export const KeywordSummaryData = (props: any) => {
  console.log('KeywordSummaryData props', props);
  const { keywordSummaryData } = props;
  
  if (!keywordSummaryData) return null;
  
  return (
    <div className={styles.keywordSummaryCard}>
      <DataUpdateTime dataUpdateTime={keywordSummaryData?.reportTime} title={keywordSummaryData?.title} />
      <div
        className={`${styles.keywordSummaryMarkdown} ${style.commentImproveSuggestionContainer}`}>
          {keywordSummaryData?.riskStatus === 'risk' && <FailureIcon />}
          <div className="flex-1">
            {/* <div className={styles.markdownHeader}>
              <div className={styles.markdownTitleIcon} />
              <div className={styles.markdownTitle}>同款商品市场迁移机会评估报告</div>
            </div> */}
            <Markdown
              text={keywordSummaryData?.keywordSummary?.summary || ''}
              chunkIntervalMs={50}
              streamGranularity="char"
              className='rightMardown'
            />
        </div>
      </div>
    </div>
  );
};