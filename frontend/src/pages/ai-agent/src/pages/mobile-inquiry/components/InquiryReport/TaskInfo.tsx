import React from 'react';
import type { TypeTaskInfo, TypeAiInsightItem } from '../../types';
import styles from './TaskInfo.module.scss';
import { $t } from '@/i18n';

interface TypeTaskInfoProps {
  taskInfo: TypeTaskInfo;
  insights: TypeAiInsightItem[];
}

const TaskInfo: React.FC<TypeTaskInfoProps> = ({ taskInfo, insights }) => {
  const {
    img,
    title,
    createTime,
    finishTime,
    supplierNum,
    questionNum,
    status,
  } = taskInfo;

  return (
    <div className={styles.detailCard}>
      <div className={styles.taskHeader}>
        <img src={img} alt={$t("global-1688-ai-app.mobile-inquiry.InquiryReport.TaskInfo.taskImage", "任务图片")} className={styles.taskImage} />
        <div className={styles.taskInfo}>
          <div className={styles.taskTitle}>{title}</div>
          <div className={styles.taskMeta}>
            <div>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.TaskInfo.gxpissue", `${questionNum}个询盘问题`, [questionNum])}</div>
            <div className={styles.metaDivider} />
            <div>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.TaskInfo.ggys", `${supplierNum}个供应商`, [supplierNum])}</div>
          </div>
          <div className={styles.timeInfo}>
            <span className={styles.timeLabel}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.TaskInfo.cj", `${createTime}创建`, [createTime])}</span>
          </div>
        </div>
      </div>

      <div className={styles.dataInsight}>
        <div className={styles.dataInsightTitle}>
          <div className={styles.dataInsightTitleIcon} />
          <div className={styles.dataInsightTitleText}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.TaskInfo.datadc", "数据洞察")}</div>
        </div>
        <div className={styles.dataInsightList}>
          {
          (insights || []).map((insight) => (
            <div className={styles.dataInsightItem} key={insight.cnKey}>
              <div className={styles.insightLabel}>{insight.cnKey}</div>
              <div className={styles.insightValue}>{insight.value}</div>
            </div>
          ))
        }
        </div>

      </div>
      {/* <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>询盘商家数</span>
          <span className={styles.statValue}>{supplierNum}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statLabel}>询问问题数</span>
          <span className={styles.statValue}>{questionNum}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statLabel}>任务状态</span>
          <span className={styles.statValue}>{status === 'FINISHED' ? '已完成' : '进行中'}</span>
        </div>
      </div> */}
    </div>
  );
};

export default TaskInfo;

