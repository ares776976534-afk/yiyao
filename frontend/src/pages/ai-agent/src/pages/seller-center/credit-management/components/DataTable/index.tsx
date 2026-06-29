import React from 'react';
import { Table, Pagination } from 'antd';
import styles from './index.module.css';
import { ColumnsType } from 'antd/es/table';

interface DataTableProps {
  dataSource: any[];
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  pageIndex: number;
  pageSize?: number;
  columns: ColumnsType<any>;
}


const DataTable: React.FC<DataTableProps> = ({
  dataSource = [],
  total = 0,
  onPageChange,
  pageIndex = 1,
  pageSize = 10,
  columns,
}) => {
  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className={styles.customTable}
        rowKey={(record, index) => `${record?.requestId}-${index}`}
        scroll={{ x: 'max-content' }}
      />

      <Pagination
        total={total}
        pageSize={pageSize}
        current={pageIndex}
        showSizeChanger
        pageSizeOptions={['10', '20', '50', '100']}
        onChange={(page, size) => {
          onPageChange(page, size);
        }}
        onShowSizeChange={(current, size) => {
          onPageChange(current, size);
        }}
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default DataTable;