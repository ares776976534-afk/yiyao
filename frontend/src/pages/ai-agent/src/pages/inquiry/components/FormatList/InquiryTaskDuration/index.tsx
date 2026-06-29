import React from 'react';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const InquiryTaskDuration: React.FC = () => {
  return (
    <span className={styles.taskDuration}>{$t("global-1688-ai-app.inquiry.FormatList.InquiryTaskDuration.ya0t", "一次询盘任务为20分钟")}</span>
  );
};

export default InquiryTaskDuration;