/**
 * 以品找商表格组件 (ProductSearchTable)
 * 用于展示以品找商搜索结果的商品对比表格
 */

import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './dynamicTable.module.scss';
import TableEmpty from './TableCellComponent/TableEmpty';
import { EnumAlign, type TypeTableData } from './types';
import { renderCell } from './cellRenderers';
import { QuestionMarkIcon, RightOutlinedIcon } from '@/components/Icon';
// import { mockTableData } from './mock';

export interface CommonTableProps {
  // tableDatas?: {
  //   tableDataList: TypeTableData<any>[];
  // };
  alwaysShowFoldText?: boolean;
  tableData: TypeTableData<any>;
  /**
   * 是否显示所有行
   * 如果为 true，则显示所有行
   * 如果为 false，则显示需要展示的行数
   * 默认值为 false
   */
  showAll?: boolean;
  onFoldClick?: () => void;
  footerRender?: () => React.ReactNode;
}
const CommonTable: React.FC<CommonTableProps> = (props) => {
  const { tableData, onFoldClick, alwaysShowFoldText = false, showAll = false, footerRender } = props;
  // const { tableData } = mockTableData;

  const { tableTitle, tableSubTitle, showRowNums,
    showCheckBox = false, isFold = false, headerGroupInfo,
    rowKey, foldText, unfoldText } = tableData?.meta || {};

  const dataSource = (tableData?.rowData || [])
    .filter((item) => item !== undefined && item !== null)
    .slice(0, !showAll && isFold && showRowNums && showRowNums > 0 ? showRowNums : undefined);

  // 被折叠了
  const isShowFold = isFold && showRowNums && showRowNums > 0 && (tableData?.rowData || []).length > showRowNums;


  // 定义表格列
  const baseColumns: ColumnsType<any> = (tableData?.headers || [])?.map((header) => {
    return {
      title: header?.headerHoverText
        ? <div
            className={styles.headerHoverText}
            style={{
            justifyContent: header.headerAlign === EnumAlign.CENTER ? 'center'
              : header.headerAlign === EnumAlign.RIGHT ? 'flex-end' : 'flex-start',
          }}
        >
          <span>{header.title}</span>
          <Tooltip title={header.headerHoverText}>
            <QuestionMarkIcon className={styles.infoIcon} width="14" height="14" />
          </Tooltip>
        </div>
        : header.title,
      dataIndex: header.key,
      width: header.width || undefined,
      align: header.headerAlign || 'left',
      key: header.key,
      render: (value: any, record: any, index: number) => {
        console.log(header.title, header.colType, value, record, index, header);
        return renderCell({
          value,
          record,
          index,
          header,
        });
      },
    };
  });

  // 处理分组表头
  let columns: ColumnsType<any> = baseColumns;
  if (headerGroupInfo?.groupHeaderList && headerGroupInfo?.groupHeaderList?.length > 0) {
    const groupHeaderKeyMap: Record<string, boolean> = {};
    headerGroupInfo.groupHeaderList.forEach((key) => {
      groupHeaderKeyMap[key] = true;
    });

    const groupedColumns: ColumnsType<any> = [];
    const groupChildren: ColumnsType<any> = [];
    let firstMatchIndex = -1;

    // 遍历所有列，找出需要分组的列
    baseColumns.forEach((column, index) => {
      const columnKey = column.key as string;
      if (groupHeaderKeyMap[columnKey]) {
        // 记录第一个匹配项的索引
        if (firstMatchIndex === -1) {
          firstMatchIndex = index;
        }
        // 将匹配的列添加到分组的 children 中
        groupChildren.push(column);
      } else {
        // 非匹配列直接添加到结果中
        groupedColumns.push(column);
      }
    });

    // 如果找到了匹配的列，创建分组表头并插入
    if (groupChildren.length > 0 && firstMatchIndex >= 0) {
      const groupColumn = {
        title: headerGroupInfo.groupTitle || '',
        children: groupChildren,
      };
      // 在第一个匹配项的位置插入分组表头
      groupedColumns.splice(firstMatchIndex, 0, groupColumn);
    }

    columns = groupedColumns;
  }

  // 计算表格最小宽度：从 columns 配置中获取所有列宽度之和
  const calculateColumnsWidth = (cols: ColumnsType<any>): number => {
    return cols.reduce((total, column) => {
      // 如果是分组列，累加其 children 的宽度
      if ('children' in column && column.children && column.children.length > 0) {
        return total + calculateColumnsWidth(column.children as ColumnsType<any>);
      }
      // 普通列，计算其宽度
      const width = column.width as number;
      const minWidth = column.minWidth as number;
      const columnWidth = width || minWidth || 0;
      return total + columnWidth;
    }, 0);
  };
  const baseTableWidth = calculateColumnsWidth(columns);

  // 复选框列宽度
  const checkboxColumnWidth = 40;
  const scrollX = showCheckBox ? baseTableWidth + checkboxColumnWidth : baseTableWidth;


  const hasFooter = alwaysShowFoldText || isShowFold;

  return (
    <div className={`${styles.agentCommonTable} ${hasFooter ? styles.hasFooter : ''}`}>
      {tableTitle ? <div className={styles.tableTitle}>{tableTitle}</div> : null}
      <Table
        // className={createInquiryMode ? styles.createInquiryModeTable : ''}
        // rowSelection={showCheckbox ? {
        //   selectedRowKeys: checkedRowKeys,
        //   hideSelectAll: true,
        //   columnWidth: checkboxColumnWidth,
        //   onChange: (selectedRowKeys) => {
        //     // 最多只允许选择指定数量
        //     if (selectedRowKeys.length <= MAX_SELECTION_COUNT) {
        //       setCheckedRowKeys(selectedRowKeys);
        //     }
        //   },
        //   getCheckboxProps: (record) => {
        //     const isDisabled = checkedRowKeys.length >= MAX_SELECTION_COUNT &&
        //       !checkedRowKeys.includes(record?.itemId || '');
        //     return {
        //       className: isDisabled ? 'checkbox-disabled-style' : '',
        //     };
        //   },
        //   onSelect: (record, selected) => {
        //     // 如果是尝试选中且已达上限，显示提示并阻止选择
        //     if (selected && checkedRowKeys.length >= MAX_SELECTION_COUNT) {
        //       toast.warning($t("global-1688-ai-app.select-business.ProductSearchTable.zzert", `最多只能选择${MAX_SELECTION_COUNT}个商品发起询盘`, [MAX_SELECTION_COUNT]));
        //       return false; // 阻止选择
        //     }
        //     return true;
        //   },
        // } : undefined}
        columns={columns}
        dataSource={dataSource}
        // loading={loading}
        locale={{
          emptyText: <TableEmpty />,
        }}
        scroll={{
          x: scrollX,
        }}
        sticky={{ offsetHeader: 0 }}
        rowKey={rowKey}
        pagination={false}
        footer={hasFooter ? () => {
          if (footerRender) {
            return footerRender?.();
          }
          return (
            <div
              onClick={() => {
                onFoldClick?.();
              }}
              className={`${styles.tableFooter} common-table-footer`}
            >
              {
                isShowFold && !showAll
                  ? <div
                      onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                    }}
                      className={styles.foldMask}
                  />
                  : null
              }
              <span>
                {showAll ? unfoldText : foldText}
              </span>
              <div className={`${styles.rightArrowIcon} ${showAll ? styles.showAll : ''} footer-icon`}>
                <RightOutlinedIcon fill="currentColor" />
              </div>
              {/* <img className={styles.rightArrowIcon} src="https://img.alicdn.com/imgextra/i1/O1CN015QDDef1fK6AxYuhEp_!!6000000003987-2-tps-32-32.png" alt="" srcSet="" /> */}
            </div>
          );
        } : undefined}
      />
    </div>
  );
};

export default CommonTable;

