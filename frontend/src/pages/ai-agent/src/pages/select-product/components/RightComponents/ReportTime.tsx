import React from 'react';
import styles from './ReportTime.module.css';
import { $t } from '@/i18n';

const ReportTime = ({ reportTime }: { reportTime?: string }) => {
  return (
    <span className={styles.reportTime}>{$t('global-1688-ai-app.ChatFlow.DataUpdateTime.dataUpdateTime', '数据更新时间')}: {reportTime}</span>
  );
};

export default ReportTime;