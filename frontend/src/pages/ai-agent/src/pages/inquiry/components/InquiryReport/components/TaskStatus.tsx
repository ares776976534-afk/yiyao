import React from 'react';
import styles from './TaskStatus.module.css';
import type { TypeTaskStatusProps } from './TaskStatus.types';
import { $t } from '@/i18n';

// 任务元数据组件
const TaskMeta: React.FC<{ data }> = ({ data }) => (
  <div className={styles.taskMeta}>
    {
      data?.taskInfo?.isAutoOrder && (
        <>
          <div className={styles.autoOrderTag}>
            <div className={styles.autoOrderIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="7" fill="#6150FF" />
                <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={styles.autoOrderText}>{$t("global-1688-ai-app.inquiry.InquiryReport.TaskStatus.yPo", "已开启自动下单")}</span>
          </div>
          <div className={styles.metaDivider} />
        </>
      )
    }
    <span className={styles.metaText}>{$t("global-1688-ai-app.inquiry.InquiryReport.TaskStatus.gxpissue", `${data?.taskInfo?.questionNum}个询盘问题`, [data?.taskInfo?.questionNum])}</span>
    <div className={styles.metaDivider} />
    <span className={styles.metaText}>{$t("global-1688-ai-app.inquiry.InquiryReport.TaskStatus.ggys", `${data?.taskInfo?.supplierNum}个供应商`, [data?.taskInfo?.supplierNum])}</span>
  </div>
);

function TaskStatus({ data }: TypeTaskStatusProps) {
  return (
    <div className={styles.container}>
      {/* 标题区域 */}
      <div className={styles.header}>
        <div className={styles.headerAccent} />
        <h2 className={styles.headerTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.TaskStatus.xpdetails", "询盘详情")}</h2>
      </div>

      {/* 任务内容卡片 */}
      <div className={styles.taskCard}>
        <div className={styles.taskContent}>
          <img
            src={data?.taskInfo?.img}
            alt={$t("global-1688-ai-app.inquiry.InquiryReport.TaskStatus.taskImage", "任务图片")}
            className={styles.taskImage}
          />
          <div className={styles.taskInfo}>
            <div className={styles.taskNameRow}>
              <span className={styles.taskName}>
                {data?.taskInfo?.title}
              </span>
            </div>
            <TaskMeta data={data} />
            {data?.taskInfo?.createTime && (
              <span className={styles.createTime}>{$t("global-1688-ai-app.inquiry.InquiryReport.TaskStatus.cj", `${data?.taskInfo?.createTime}创建`, [data?.taskInfo?.createTime])}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskStatus;