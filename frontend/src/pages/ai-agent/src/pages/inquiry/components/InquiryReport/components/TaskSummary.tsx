import { Card } from 'antd';
import styles from './TaskSummary.module.css';
import { Markdown } from '@/components/ChatFlow/Markdown';
import { $t } from '@/i18n';

function TaskSummary({ summaryData }: { summaryData?: string }) {
  return (
    <div className={styles.taskSummary}>
      <div className={styles.header}>
        <div className={styles.headerAccent} />
        <h2 className={styles.headerTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.TaskSummary.taskzj", "任务总结")}</h2>
      </div>
      <Card className={styles.summaryCard}>
        <div className={styles.summaryContent}>
          <Markdown
            text={summaryData}
            chunkIntervalMs={50}
            streamGranularity="char"
          />
        </div>
      </Card>
    </div>
  );
}

export default TaskSummary;