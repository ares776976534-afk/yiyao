import React, { useState } from 'react';
import { Pagination, Select, Input, Button } from 'antd';
import { OrderPaginationProps } from '../../types';
import styles from './index.module.css';
import { $t } from '@/i18n';

const { Option } = Select;

const OrderPagination: React.FC<OrderPaginationProps> = ({
  current,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange
}) => {
  const [gotoPage, setGotoPage] = useState<string>('');

  const handleGoto = (): void => {
    const page = parseInt(gotoPage);
    if (page && page > 0 && page <= Math.ceil(total / pageSize)) {
      onPageChange(page);
      setGotoPage('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageSizeSelector}>
        <span className={styles.label}>{$t("global-1688-ai-app.seller-center.order-management.OrderPagination.my", "每页")}</span>
        <Select
          value={pageSize}
          onChange={onPageSizeChange}
          className={styles.select}
          size="small"
        >
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={50}>50</Option>
          <Option value={100}>100</Option>
        </Select>
        <span className={styles.label}>{$t("global-1688-ai-app.seller-center.order-management.OrderPagination.t", "条")}</span>
      </div>

      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onPageChange}
        showSizeChanger={false}
        showQuickJumper={false}
        className={styles.pagination}
      />

      <div className={styles.gotoContainer}>
        <span className={styles.label}>{$t("global-1688-ai-app.seller-center.order-management.OrderPagination.qw", "前往")}</span>
        <div className={styles.gotoInputContainer}>
          <Input
            placeholder={$t("global-1688-ai-app.seller-center.order-management.OrderPagination.qinput", "请输入")}
            value={gotoPage}
            onChange={(e) => setGotoPage(e.target.value)}
            onPressEnter={handleGoto}
            className={styles.gotoInput}
            size="small"
          />
          <Button
            type="link"
            onClick={handleGoto}
            className={styles.gotoButton}
          >{$t("global-1688-ai-app.seller-center.order-management.OrderPagination.qd", "确定")}</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderPagination;