import React, { useState } from 'react';
import { Table } from 'antd';
import styles from './index.module.css';
import type { TableColumnsType, TableProps } from 'antd';

const { Column, ColumnGroup } = Table;
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface CommonTableProps {
  title?: React.ReactNode | string;
  dataIndex?: string;
  key?: string;
  children?: CommonTableProps[];
  render?: (text: any, record: any, index?: number, extraProps?: {
    onActionClick: (data: any) => void;
    onRowClick: () => void;
    openRowKeys: any[];
  }) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  sorter?: boolean | ((a: any, b: any) => number);
  [key: string]: any; // 允许其他 antd Table Column 属性
}

const CommonTable: React.FC<{
  data: any[];
  columns: CommonTableProps[];
  containerWidth?: number;
  onActionComplete?: (typeAndData: any) => void;
  rowClassName?: (record: any, index?: number) => string;
  onRow?: (record: any, index?: number) => React.HTMLAttributes<any>;
  hasRowSelection?: boolean;
  onCheckRowChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
  className?: string;
}> = ({ data, columns, containerWidth, onActionComplete, rowClassName, onRow, hasRowSelection = false, onCheckRowChange, className, ...otherProps }: CommonTableProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleActionClick = (typeAndData) => {
    if (typeof onActionComplete === 'function') {
      onActionComplete(typeAndData);
    }
  };

  const renderColumns = (columnsToRender) => {
    // 安全检查：确保 columns 是数组
    if (!Array.isArray(columnsToRender)) {
      return null;
    }

    return columnsToRender.map((col, index) => {
      // 提取key属性，避免展开时包含key
      const { key, ...restCol } = col;
      const uniqueKey = key || col?.dataIndex || `column-${index}`;
      const __col = {
        ...restCol,
        // 只有当 col.render 存在且是函数时，才添加自定义 render
        ...(col.render && typeof col.render === 'function' && {
          render: (value, record, index) => {
            return col.render(value, record, index, {
              onActionClick: handleActionClick,
              onRowClick: () => { },
              openRowKeys: [],
            });
          },
        }),
      };
      if (__col?.children) {
        return (
          <ColumnGroup
            className={styles.columnGroup}
            key={uniqueKey}
            {...__col}
          >
            {renderColumns(col.children)}
          </ColumnGroup>
        );
      }
      return <Column key={uniqueKey} {...__col} />;
    });
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: any[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onCheckRowChange && onCheckRowChange(newSelectedRowKeys, selectedRows);
  };
  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <Table
      dataSource={data}
      pagination={false}
      className={`${styles.commonTable} ${className}`}
      style={{ width: `${containerWidth}px` }}
      scroll={{ x: 'max-content' }}
      rowClassName={rowClassName}
      onRow={onRow}
      rowKey={(record) => {
        // 优先使用 record 中的唯一标识符
        if (record?.orderId) return String(record?.orderId);
        if (record?.key) return String(record?.key);
        if (record?.offerId) return String(record?.offerId);

        // 如果没有明确的 id 或 key，尝试使用其他唯一属性
        if (record?.uuid) return String(record?.uuid);
        if (record?.code) return String(record?.code);
        if (record?.name) return `name-${record?.name}`;

        // 最后使用多个属性组合生成唯一key，避免使用index
        const fallbackKey = [
          record?.title,
          record?.companyName,
          record?.price,
          JSON.stringify(record)
        ].filter(Boolean).join('-');

        return fallbackKey || `record-${Math.random().toString(36).substr(2, 9)}`;
      }}
      rowSelection={hasRowSelection ? rowSelection : undefined}
      {...otherProps}
    >
      {renderColumns(columns)}
    </Table>
  );
};

export default CommonTable;