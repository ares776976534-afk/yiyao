import { Card } from 'antd';
import styles from './TaskSummary.module.css';
import { ClassificationIcon } from '@/components/Icon';
import { Markdown } from '@/components/ChatFlow/Markdown';
import { $t } from '@/i18n';

function TaskSummary({ summaryData }: { summaryData?: string }) {

  return (
    <div className={styles.taskSummary}>
      <div className={styles.header}>
        <ClassificationIcon className={styles.headerIcon} />
        <span className={styles.headerTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskSummary.AItaskzj", "AI 任务总结")}</span>
      </div>
      <Card className={styles.summaryCard}>
        <div className={styles.summaryContent}>
          <Markdown
            text={summaryData}
            chunkIntervalMs={50}
            streamGranularity="char"
            className='rightMardown'
          />
        </div>
      </Card>
    </div>
  );
}

export default TaskSummary;