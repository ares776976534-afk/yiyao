import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import { SearchIcon } from '@/components/Icon';
import OrderTable from './components/OrderTable';
import OrderPagination from './components/OrderPagination';
import Framework from '@/components/BaseFramework';
import { getOrderList } from '@/pages/seller-center/services';
import { definePageConfig } from 'ice';

import styles from './index.module.css';
import { $t } from '@/i18n';

const SearchPannel = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };

  const handleSearch = (): void => {
    onSearch(searchValue);
  };
  return (
    <div className={styles.searchContainer}>
      <SearchIcon className={styles.searchIcon} />
      <Input
        placeholder={$t("global-1688-ai-app.seller-center.order-management.shr", "搜索订单ID…")}
        value={searchValue}
        onChange={handleSearchInputChange}
        onPressEnter={handleSearch}
        className={styles.searchInput}
      />
      <Button
        type="primary"
        onClick={handleSearch}
        className={styles.searchButton}
        autoInsertSpace={false}
      >{$t("global-1688-ai-app.seller-center.order-management.search", "搜索")}</Button>
    </div>
  )
}

const OrderManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  const handleSearch = (searchValue: string): void => {
    setCurrentPage(1);
    getData({
      pageIndex: 1,
      pageSize: pageSize,
      orderId: searchValue,
    });
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    getData({
      pageIndex: page,
      pageSize: pageSize,
    });
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setCurrentPage(1);
    getData({
      pageIndex: 1,
      pageSize: size,
    });
  };

  const getData = (params: any): void => {
    getOrderList(params).then((res) => {
      if (res.success) {
        const {
          totalRecords,
          data,
        } = res.data;
        setOrderList(data);
        setTotal(totalRecords);
      } else {
        setOrderList([]);
        setTotal(0);
      }
    })
      .catch(() => {
        setOrderList([]);
        setTotal(0);
      });
  };

  useEffect(() => {
    getData({
      pageIndex: currentPage,
      pageSize: pageSize,
    });
  }, []);

  return (
    <Framework title={$t("global-1688-ai-app.seller-center.order-management.qborder", "全部订单")} right={<SearchPannel onSearch={handleSearch} />}>
      <div className={styles.tableContainer}>
        <OrderTable dataSource={orderList} />
        <OrderPagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </Framework>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.seller-center.order-management.ordergl", "订单管理"),
  spm: {
    spmB: 'seller-center-order-management',
  },
});

export default OrderManagement;