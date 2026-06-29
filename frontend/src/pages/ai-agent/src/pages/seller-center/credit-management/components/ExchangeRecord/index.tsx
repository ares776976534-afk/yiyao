import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input, DatePicker } from 'antd';
import DataTable from '../DataTable';
import { FilterProps } from '../../types';
import styles from './index.module.css';
import { getBalanceCostList } from '@/pages/seller-center/services';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { exchangeColumns } from '../ExchangeColumns';
import { $t } from '@/i18n';

const ExchangeRecord: React.FC<FilterProps> = () => {
  const [costList, setCostList] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const requestData = useCallback((params: any) => {
    const requestParams = {
      ...params,
      scene: 'marco',
      pageSize: params.pageSize || pageSize,
      startTime: params.startTime ? dayjs(params.startTime).startOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
      endTime: params.endTime ? dayjs(params.endTime).endOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
    };

    getBalanceCostList(requestParams)
      .then((res) => {
        const { success, data } = res;
        if (success) {
          setPageIndex(requestParams.pageIndex);
          if (requestParams.pageSize) {
            setPageSize(requestParams.pageSize);
          }
          setCostList(data?.data || []);
          setTotal(data.totalRecords);
        }
      });
  }, [pageSize]);

  const getDataRef = useRef(debounce(requestData, 500));
  useEffect(() => {
    getDataRef.current = debounce(requestData, 500);
  }, [requestData]);

  const getData = useCallback((params: any) => {
    getDataRef.current(params);
  }, []);

  const handlePageChange = (page: number, size: number) => {
    setPageIndex(page);
    setPageSize(size);
    getData({ ...filters, pageIndex: page, pageSize: size });
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(Object.assign({}, newFilters));
    // 必须两个有值或者同时为空才请求
    if ((key === 'startTime' || key === 'endTime') && !(newFilters.startTime && newFilters.endTime || !newFilters.startTime && !newFilters.endTime)) {
      return;
    }
    setPageIndex(1);
    getData({ ...newFilters, pageIndex: 1, pageSize });
  };

  useEffect(() => {
    getData({ ...filters, pageIndex, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.usageDetails}>
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Request ID</label>
          <Input
            className={styles.filterInput}
            placeholder={$t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.iRs", "输入Request ID……")}
            value={filters.requestId}
            onChange={(event) => handleFilterChange('requestId', event.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.dateRangeWrapper}>
            <div className={styles.dateRange}>
              <label className={styles.filterLabel}>{$t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.startTime", "开始时间")}</label>
              <DatePicker
                className={styles.dateInput}
                value={filters.startTime}
                onChange={(date) => handleFilterChange('startTime', date)}
                placeholder={$t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.qce", "请选择日期")}
                disabledDate={(current) => filters.endTime && current && current.isAfter(filters.endTime, 'day')}
              />
            </div>
            <span className={styles.dateSeparator}>～</span>
            <div className={styles.dateRange}>
              <label className={styles.filterLabel}>{$t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.endTime", "结束时间")}</label>
              <DatePicker
                className={styles.dateInput}
                value={filters.endTime}
                onChange={(date) => handleFilterChange('endTime', date)}
                placeholder={$t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.qce", "请选择日期")}
                disabledDate={(current) => filters.startTime && current && current.isBefore(filters.startTime, 'day')}
              />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        dataSource={costList}
        total={total}
        onPageChange={handlePageChange}
        pageIndex={pageIndex}
        pageSize={pageSize}
        columns={exchangeColumns}
      />
    </div>
  );
};

export default ExchangeRecord;