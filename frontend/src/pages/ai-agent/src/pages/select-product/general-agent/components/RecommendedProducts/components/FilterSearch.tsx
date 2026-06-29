import styles from './filterSearch.module.scss';
import { Form, InputNumber, Button, Input, DatePicker, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import SortOptions from './SortOptions';
import { DeleteOutlinedIcon } from '@/components/Icon';
import { filterConfig } from '../filterConfig';
import { $t } from "@/i18n";

const { RangePicker } = DatePicker;

interface FilterSearchProps {
  onSortChange?: (p: { sortField: string; sortType: 'ASC' | 'DESC'; filterParams?: Record<string, any> }) => void;
}
const FilterSearch = ({ onSortChange }: FilterSearchProps) => {
  const [filterConfigs, setFilterConfigs] = useState<any[]>([]);
  const [sortOptions, setSortOptions] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [form] = Form.useForm();

  const emitSearch = (sortField: string, sortType: 'ASC' | 'DESC') => {
    onSortChange?.({
      sortField,
      sortType,
      ...form.getFieldsValue(),
    });
  };
  const onValuesChange = () => {
    emitSearch(sortKey, sortOrder);
  };
  const onClear = () => {
    form.resetFields();
    emitSearch(sortKey, sortOrder);
  };
  useEffect(() => {
    setFilterConfigs(filterConfig.platform[0].filter);
    setSortOptions(filterConfig.platform[0].sort);
  }, []);
  const handleSortSelect = (field: string, order: 'ASC' | 'DESC') => {
    setSortKey(field);
    setSortOrder(order);
    emitSearch(field, order);
  };
  const renderFilter = (filter: any) => {
    const { code, label, maxCode, maxBackgroundWords, minCode, minBackgroundWords, sold30dPlaceholder, startPlaceholder, endPlaceholder } = filter;
    switch (filter.type) {
      case "rangeInput":
        return (
          <Form.Item key={minCode} label={label} className={styles.priceItem}>
            <div className={styles.priceGroup}>
              <Form.Item name={minCode} noStyle>
                <InputNumber placeholder={minBackgroundWords} className={styles.priceInput} controls={false} />
              </Form.Item>
              <span className={styles.priceSep}>-</span>
              <Form.Item name={maxCode} noStyle>
                <InputNumber placeholder={maxBackgroundWords} className={styles.priceInput} controls={false} />
              </Form.Item>
            </div>
          </Form.Item>
        )
      case "input":
        return (
          <Form.Item key={code} label={label} name={code}>
            <Input placeholder={sold30dPlaceholder} />
          </Form.Item>
        )
      case "timeRangeInput":
        return (
          <Form.Item key={code} label={label} name={code}>
            <RangePicker placeholder={[startPlaceholder, endPlaceholder]} />
          </Form.Item>
        )
      default:
        return null;
    }
  }
  return (
    <ConfigProvider locale={zhCN}>
      <div className={styles.filterSearch}>
        <Form form={form} name="filterSearch" colon={false} onValuesChange={onValuesChange}>
          <div className={styles.filterGrid}>
            {filterConfigs.map(renderFilter)}
            <Form.Item label=" " colon={false} className={styles.clearItem}>
              <Button type="text" htmlType="button" onClick={onClear} className={styles.clearBtn}>
                <DeleteOutlinedIcon />
                {$t("global-1688-ai-app.select-product.general-agent.FilterSearch.clearFilter", "清空筛选")}
              </Button>
            </Form.Item>
          </div>
        </Form>
        <SortOptions
          sortOptions={sortOptions}
          sortKey={sortKey}
          sortType={sortOrder}
          onSortSelect={handleSortSelect}
        />
      </div>
    </ConfigProvider>
  );
};
export default observer(FilterSearch);