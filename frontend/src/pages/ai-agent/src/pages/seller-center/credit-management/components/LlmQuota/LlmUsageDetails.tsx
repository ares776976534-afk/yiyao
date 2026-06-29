import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input, DatePicker, Select, Checkbox } from 'antd';
import DataTable from '../DataTable';
import styles from '../ExchangeRecord/index.module.css';
import { getBalanceCostList } from '@/pages/seller-center/services';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { llmColumns } from '../llmColumns';
import { $t } from '@/i18n';

const MODEL_OPTIONS = [
  { label: 'qwen3-max-preview', value: 'qwen3-max-preview' },
  { label: 'qwen3-vl-flash', value: 'qwen3-vl-flash' },
  { label: 'qwen3.5-plus', value: 'qwen3.5-plus' },
  { label: 'qwen3.5-flash', value: 'qwen3.5-flash' },
];

const LlmUsageDetails: React.FC = () => {
  const [costList, setCostList] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const requestData = useCallback((params: any) => {
    const requestParams = {
      ...params,
      scene: 'llm',
      pageSize: params.pageSize || pageSize,
      startTime: params.startTime ? dayjs(params.startTime).startOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
      endTime: params.endTime ? dayjs(params.endTime).endOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
    };
    if (params.modelTypes?.length) {
      requestParams.modelTypes = params.modelTypes;
    }

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
    getData({ ...filters, modelTypes: selectedModels, pageIndex: page, pageSize: size });
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(Object.assign({}, newFilters));
    if ((key === 'startTime' || key === 'endTime') && !(newFilters.startTime && newFilters.endTime || !newFilters.startTime && !newFilters.endTime)) {
      return;
    }
    setPageIndex(1);
    getData({ ...newFilters, modelTypes: selectedModels, pageIndex: 1, pageSize });
  };

  const handleModelChange = (values: string[]) => {
    setSelectedModels(values);
    setPageIndex(1);
    getData({ ...filters, modelTypes: values, pageIndex: 1, pageSize });
  };

  useEffect(() => {
    getData({ ...filters, modelTypes: selectedModels, pageIndex, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dropdownRender = () => (
    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox
        indeterminate={selectedModels.length > 0 && selectedModels.length < MODEL_OPTIONS.length}
        checked={selectedModels.length === MODEL_OPTIONS.length}
        onChange={(e) => {
          const all = e.target.checked ? MODEL_OPTIONS.map(o => o.value) : [];
          handleModelChange(all);
        }}
      >
        {$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.allModels', '全部模型')}
      </Checkbox>
      {MODEL_OPTIONS.map((opt) => (
        <Checkbox
          key={opt.value}
          checked={selectedModels.includes(opt.value)}
          onChange={(e) => {
            const next = e.target.checked
              ? [...selectedModels, opt.value]
              : selectedModels.filter((v) => v !== opt.value);
            handleModelChange(next);
          }}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );

  return (
    <div className={styles.usageDetails}>
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Request ID</label>
          <Input
            className={styles.filterInput}
            placeholder={$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.iRs', '输入Request ID……')}
            value={filters.requestId}
            onChange={(event) => handleFilterChange('requestId', event.target.value)}
          />
        </div>

        {/* <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            {$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.modelType', '模型类型')}
          </label>
          <Select
            mode="multiple"
            allowClear
            showSearch={false}
            open={dropdownOpen}
            onDropdownVisibleChange={setDropdownOpen}
            style={{ width: 300, height: 36 }}
            placeholder={$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.selectModel', '请选择模型')}
            value={selectedModels}
            onChange={handleModelChange}
            maxTagCount={0}
            maxTagPlaceholder={() =>
              selectedModels.length
                ? $t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.selectedCount', `已选 ${selectedModels.length} 个模型`, [selectedModels.length])
                : undefined
            }
            dropdownRender={() => dropdownRender()}
            options={[]}
          />
        </div> */}

        <div className={styles.filterGroup}>
          <div className={styles.dateRangeWrapper}>
            <div className={styles.dateRange}>
              <label className={styles.filterLabel}>{$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.startTime', '开始时间')}</label>
              <DatePicker
                className={styles.dateInput}
                value={filters.startTime}
                onChange={(date) => handleFilterChange('startTime', date)}
                placeholder={$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.selectDate', '请选择日期')}
                disabledDate={(current) => filters.endTime && current && current.isAfter(filters.endTime, 'day')}
              />
            </div>
            <span className={styles.dateSeparator}>～</span>
            <div className={styles.dateRange}>
              <label className={styles.filterLabel}>{$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.endTime', '结束时间')}</label>
              <DatePicker
                className={styles.dateInput}
                value={filters.endTime}
                onChange={(date) => handleFilterChange('endTime', date)}
                placeholder={$t('global-1688-ai-app.seller-center.credit-management.LlmUsageDetails.selectDate', '请选择日期')}
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
        columns={llmColumns}
      />
    </div>
  );
};

export default LlmUsageDetails;
