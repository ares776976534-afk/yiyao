import React, { useState } from 'react';
import { TypeTableData } from "@/components/CommonTable";
import DynamicTable from "@/components/CommonTable/DynamicTable";
import styles from './index.module.scss';

const TableList: React.FC<{
  rawData: {
    tableDataList: TypeTableData<any>[];
  };
}> = (props) => {
  const { rawData } = props;
  const { tableDataList } = rawData || {};
  const [showAllMap, setShowAllMap] = useState<Record<number, boolean>>({});

  return (
    <div className={styles.commonTablesList}>
      {
        (tableDataList || []).map((tableDataItem, index) => (
          <div className={`${styles.tableItemWrapper} ${showAllMap[index] ? styles.expanded : styles.collapsed}`}>
            <DynamicTable
              alwaysShowFoldText={false}
              onFoldClick={() => {
              setShowAllMap((prev) => ({
                ...prev,
                [index]: !prev[index],
              }));
            }}
              showAll={showAllMap[index] || false}
              key={tableDataItem?.meta?.tableTitle + index}
              tableData={tableDataItem}
            />
          </div>
        ))
      }
    </div>
  );
};

export default TableList;
