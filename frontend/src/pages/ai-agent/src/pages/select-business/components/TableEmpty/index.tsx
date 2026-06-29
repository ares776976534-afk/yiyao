import React from 'react';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const TableEmpty: React.FC = () => {
  return (
    <div className={styles.emptyContainer}>
      <img src="https://gw.alicdn.com/imgextra/i2/O1CN01eWtwpP1fWvJ1RqsWE_!!6000000004015-2-tps-324-324.png" alt="" />
      <div className={styles.emptyText}>{$t("global-1688-ai-app.select-business.TableEmpty.noData", "暂无数据")}</div>
    </div>
  );
};

export default TableEmpty;
