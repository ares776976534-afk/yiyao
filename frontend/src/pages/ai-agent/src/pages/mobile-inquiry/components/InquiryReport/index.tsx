import React from 'react';
import type { TypeInquiryReportCard } from '../../types';
import TaskInfo from './TaskInfo';
import AiInsight from './AiInsight';
import SupplierTable from './SupplierTable';
import styles from './index.module.scss';
import { Markdown } from '@/components/MobileMarkdown';
import { $t } from '@/i18n';

interface TypeInquiryReportProps {
  data: TypeInquiryReportCard;
}

const InquiryReport: React.FC<TypeInquiryReportProps> = ({ data }) => {
  const { detail } = data;
  const { taskInfo, aiInsight, supplierCompare, tableHead, aiSummary } = detail;

  return (
    <div className={styles.container}>
      {/* 提示卡片 */}
      <div className={styles.tipContainer}>
        <div className={styles.tipCard}>
          <span className={styles.tipText}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.fkThenc", "访问PC端，可查看任务执行，以及与商家沟通过程")}</span>
        </div>
      </div>

      {/* 询盘详情 */}
      <div className={styles.inquiryDetails}>
        <div className={styles.sectionHeader}>
          <div className={styles.indicator} />
          <span className={styles.sectionTitle}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.xpdetails", "询盘详情")}</span>
        </div>

        <TaskInfo taskInfo={taskInfo} insights={aiInsight} />
      </div>

      {/* 任务终结 */}
      <div className={styles.taskConclusion}>
        <div className={styles.sectionHeader}>
          <div className={styles.indicator} />
          <span className={styles.sectionTitle}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.taskzj", "任务总结")}</span>
        </div>
        <Markdown text={aiSummary} />
      </div>

      {/* 供应商对比 */}
      <div className={styles.supplierComparison}>
        <div className={styles.sectionHeader}>
          <div className={styles.indicator} />
          <span className={styles.sectionTitle}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.gysdb", "供应商对比")}</span>
        </div>

        <SupplierTable
          supplierCompare={supplierCompare}
          tableHead={tableHead}
        />
      </div>
    </div>
  );
};

export default InquiryReport;

