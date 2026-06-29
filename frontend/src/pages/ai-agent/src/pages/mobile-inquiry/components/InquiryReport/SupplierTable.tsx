import React, { useRef, useState, useEffect } from 'react';
import type { TypeSupplierCompare, TypeTableHead } from '../../types';
import styles from './SupplierTable.module.scss';
import classNames from 'classnames';
import { $t } from '@/i18n';

interface TypeSupplierTableProps {
  supplierCompare: TypeSupplierCompare[];
  tableHead: TypeTableHead[];
}

const SupplierTable: React.FC<TypeSupplierTableProps> = ({ supplierCompare, tableHead }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 获取每个供应商的回答映射
  const getAnswerValue = (answers: any[], key: string) => {
    const answer = answers.find((ans) => ans.key === key);
    return answer?.value || '/';
  };

  // 监听滚动事件
  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    const handleScroll = () => {
      setIsScrolled(tableElement.scrollLeft > 0);
    };

    tableElement.addEventListener('scroll', handleScroll);
    // 初始检查
    handleScroll();

    return () => {
      tableElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <div
          ref={tableRef}
          className={styles.table}
          style={{
            gridTemplateColumns: `32vw repeat(${tableHead.length - 1}, 32vw) minmax(32vw, 1fr)`,
          }}
        >
          {/* 表头 - 供应商列 */}
          <div
            className={classNames(
              styles.headerCell,
              styles.supplierHeaderCell,
              { [styles.scrolled]: isScrolled },
            )}
          >
            <span className={styles.headerText}>{$t("global-1688-ai-app.mobile-inquiry.InquiryReport.SupplierTable.gys", "供应商")}</span>
          </div>

          {/* 表头 - 其他列 */}
          {tableHead.map((head, index) => (
            <div
              key={head.key}
              className={classNames(styles.headerCell, {
                [styles.lastColumn]: index === tableHead.length - 1,
              })}
            >
              <span className={styles.headerText}>{head.cnKey}</span>
            </div>
          ))}

          {/* 表格内容 */}
          {supplierCompare.map((supplier, rowIndex) => (
            <React.Fragment key={supplier.conversationId}>
              {/* 供应商信息列 */}
              <div
                className={classNames(
                  styles.supplierCell,
                  {
                    [styles.scrolled]: isScrolled,
                    [styles.lastRow]: rowIndex === supplierCompare.length - 1,
                  },
                )}
              >
                <div className={styles.supplierInfo}>
                  <img
                    src={supplier.sellerInfo.headImg}
                    className={styles.supplierAvatar}
                    alt={$t("global-1688-ai-app.mobile-inquiry.InquiryReport.SupplierTable.gysavatar", "供应商头像")}
                  />
                  <div className={styles.supplierDetails}>
                    <div className={styles.supplierName}>
                      {supplier.sellerInfo.companyName}
                    </div>
                    {/* {supplier.sellerInfo.isBest && (
                      <div className={styles.bestTag}>
                        <span className={styles.bestText}>最佳推荐</span>
                      </div>
                    )} */}
                  </div>
                </div>
                {/* <div className={styles.cellGradient} /> */}
              </div>

              {/* 数据列 */}
              {tableHead.map((head, colIndex) => {
                const value = getAnswerValue(supplier.inquiryAnswers, head.key);
                const isEmpty = value === '/' || !value;

                return (
                  <div
                    key={head.key}
                    className={classNames(styles.dataCell, {
                      [styles.lastColumn]: colIndex === tableHead.length - 1,
                      [styles.lastRow]: rowIndex === supplierCompare.length - 1,
                    })}
                  >
                    <span className={isEmpty ? styles.cellTextGray : styles.cellText}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {/* <div className={styles.tableIndicator} /> */}
      </div>
    </div>
  );
};

export default SupplierTable;

