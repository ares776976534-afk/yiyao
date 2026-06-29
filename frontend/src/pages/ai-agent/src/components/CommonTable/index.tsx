/**
 * 以品找商表格组件 (ProductSearchTable)
 * 用于展示以品找商搜索结果的商品对比表格
 */

import React from 'react';
import styles from './index.module.scss';
import type { TypeTableData } from './types';
import DynamicTable from './DynamicTable';

export type { TypeTableData };

export interface CommonTableProps {
  tableData?: {
    tableDataList: TypeTableData<any>[];
  };
  tableDatas?: {
    tableDataList: TypeTableData<any>[];
  };
  onFoldClick?: () => void;
  /**
   * 折叠文本是否总是显示
   * 如果为 true，则总是显示折叠文本，需要同时满足有折叠属性
   * 如果为 false，但表格数量大于 需要展示的行数 才则显示折叠文本
   * 默认值为 true
   */
  alwaysShowFoldText?: boolean;
  /**
   * 是否显示所有行
   * 如果为 true，则显示所有行
   * 如果为 false，则显示需要展示的行数
   * 默认值为 false
   */
  showAll?: boolean;
  cardId?: string;
  cardType?: string;
  cardSubType?: string;
}
const CommonTables: React.FC<CommonTableProps> = (props) => {
  const { cardId, cardType, cardSubType,
     tableData, tableDatas, onFoldClick, alwaysShowFoldText = false, showAll = false } = props;
  const { tableDataList = [] } = tableData || tableDatas || { };

  // console.log('tableDataList', tableDataList);
  return (
    <div
      className={styles.commonTables}
      data-card-id={cardId}
      data-card-type={cardType}
      data-card-sub-type={cardSubType}
    >
      {
        tableDataList.map((tableDataItem, index) => (
          <DynamicTable
            alwaysShowFoldText={alwaysShowFoldText}
            onFoldClick={() => {
              // console.log('onFoldClick', tableDataItem);
              onFoldClick?.();
            }}
            showAll={showAll}
            key={tableDataItem?.meta?.tableTitle + index}
            tableData={tableDataItem}
          />
        ))
      }
    </div>
  );
};

export default CommonTables;

