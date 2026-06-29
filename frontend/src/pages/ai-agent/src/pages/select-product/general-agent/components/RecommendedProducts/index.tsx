import { useState, useEffect, useCallback } from 'react';
import ModeSwitch, { type TypeViewMode } from './components/ModeSwitch';
import FilterSearch from './components/FilterSearch';
import styles from './index.module.scss';
import BigMode from './components/BigMode';
import { Pagination, ConfigProvider } from 'antd';
import { DownArrowIcon } from '@/components/Icon';
import ListMode from './components/ListMode';
import type { listDataProps } from './interface';
import { filterListByParams, sortListByField } from './filterList';
import { $t } from '@/i18n';
import Empty from './components/Empty';

interface RecommendedProductsProps {
  listData: listDataProps[];
}
const RecommendedProducts = ({ listData }: RecommendedProductsProps) => {
  const [viewMode, setViewMode] = useState<TypeViewMode>('big');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});
  const [pagedListData, setPagedListData] = useState<listDataProps[]>([]);
  const [filteredTotal, setFilteredTotal] = useState(listData.length);

  const getList = useCallback(() => {
    const { sortField = '', sortType = 'ASC', ...rest } = filterParams;
    let rows = filterListByParams(listData, rest as Record<string, unknown>);
    rows = sortListByField(rows, sortField, sortType);
    const total = rows.length;
    setFilteredTotal(total);
    const start = (current - 1) * pageSize;
    setPagedListData(rows.slice(start, start + pageSize));
  }, [listData, current, pageSize, filterParams]);

  useEffect(() => {
    getList();
  }, [getList]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTotal / pageSize) || 1);
    if (current > maxPage) {
      setCurrent(maxPage);
    }
  }, [current, pageSize, filteredTotal]);

  const onSortChange = (p: Record<string, any>) => {
    setFilterParams(p);
    setCurrent(1);
  };

  const handlePaginationChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  };

  const pageOffset = (current - 1) * pageSize;

  const handleViewModeChange = (mode: TypeViewMode) => {
    setViewMode(mode);
    setCurrent(1);
    setPageSize(12);
    setFilterParams({});
  };

  return (
    <div className={styles.recommendedProducts} data-recommended-products>
      <div className={styles.recommendedProductsTop}>
        <ModeSwitch mode={viewMode} onModeChange={handleViewModeChange} />
        <FilterSearch
          key={viewMode}
          onSortChange={onSortChange}
        />
      </div>
      {pagedListData.length > 0 ? (
        <div className={styles.recommendedProductsContent}>
          {viewMode === 'big' ? (
            <BigMode listData={pagedListData} />
          ) : (
            <ListMode listData={pagedListData} />
          )}
          <ConfigProvider
            theme={{
              components: {
                Pagination: {
                  itemActiveBg: '#6E50FF',
                  itemActiveColor: '#fff',
                },
              },
            }}
          >
            <Pagination
              current={current}
              pageSize={pageSize}
              onChange={handlePaginationChange}
              total={filteredTotal}
              showSizeChanger={{
                options: [
                  { label: `12${$t('global-1688-ai-app.select-product.RecommendedProducts.pageSize', '条/页')}`, value: 12 },
                  { label: `24${$t('global-1688-ai-app.select-product.RecommendedProducts.pageSize', '条/页')}`, value: 24 },
                  { label: `36${$t('global-1688-ai-app.select-product.RecommendedProducts.pageSize', '条/页')}`, value: 36 },
                  { label: `48${$t('global-1688-ai-app.select-product.RecommendedProducts.pageSize', '条/页')}`, value: 48 },
                ],
                suffixIcon: <DownArrowIcon color="var(--text-accent)" />,
              }}
            />
          </ConfigProvider>
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default RecommendedProducts;
