import React, { useState, useMemo, useEffect } from 'react';
import styles from './PaginationComponent.module.css';
import { Select, InputNumber } from 'antd';
import { $t } from '@/i18n';

interface TypePaginationComponentProps {
  total: number;
  current?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  footerName?: string
}

const PaginationComponent: React.FC<TypePaginationComponentProps> = ({ 
  total, 
  current = 1, 
  pageSize = 10, 
  onChange,
  footerName = $t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.treview", "条评价"),
}) => {
  const [currentPage, setCurrentPage] = useState(current);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [jumpValue, setJumpValue] = useState(null as number | null);

  // 同步外部传入的 current 和 pageSize
  useEffect(() => {
    setCurrentPage(current);
    // 清空跳转输入框
    setJumpValue(null);
  }, [current]);

  useEffect(() => {
    setCurrentPageSize(pageSize);
  }, [pageSize]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(total / currentPageSize);
  }, [total, currentPageSize]);

  // 页面切换处理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onChange?.(page, currentPageSize);
    }
  };

  // 每页条数变化处理
  const handlePageSizeChange = (size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // 重置到第一页
    onChange?.(1, size);
  };

  // 跳转到指定页
  const handleJumpToPage = () => {
    if (jumpValue !== null && jumpValue >= 1 && jumpValue <= totalPages) {
      handlePageChange(jumpValue);
      setJumpValue(null);
    }
  };

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // 显示的页码数量

    if (totalPages <= showPages + 2) {
      // 总页数较少时，显示全部页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数较多时，显示部分页码
      if (currentPage <= 3) {
        // 当前页在前面
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后面
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };
  return (
    <div className={styles.container}>
      <span className={styles.totalText}>
        <span className={styles.totalLabel}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.g", "共")}</span>
        <span className={styles.totalNumber}>{total} </span>
        <span className={styles.totalLabel}>{footerName}</span>
      </span>
      <div className={styles.paginationControls}>
        <div className={styles.pageSize}>
          <span className={styles.pageSizeLabel}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.my", "每页")}</span>
          <Select
            value={currentPageSize}
            onChange={handlePageSizeChange}
            className={styles.pageSizeSelect} 
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
            />
          <span className={styles.pageSizeUnit}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.t", "条")}</span>
        </div>
        {totalPages > 0 && (
          <>
            <div className={styles.paginationWrapper}>
              <div 
                className={`${styles.prevButton} ${currentPage <= 1 ? styles.disabled : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <span className={styles.prevText}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.syy", "上一页")}</span>
              </div>
              <div className={styles.pageNumbers}>
                {generatePageNumbers().map((page, index) => (
                  <div 
                    key={index}
                    className={
                      page === currentPage 
                        ? styles.pageNumberActive 
                        : page === '...' 
                          ? styles.pageNumber 
                          : styles.pageNumber
                    }
                    onClick={() => {
                      if (typeof page === 'number' && page !== currentPage) {
                        handlePageChange(page);
                      }
                    }}
                    style={{ 
                      cursor: typeof page === 'number' && page !== currentPage ? 'pointer' : 'default' 
                    }}
                  >
                    <span className={
                      page === currentPage 
                        ? styles.pageNumberActiveText 
                        : styles.pageNumberText
                    }>
                      {page}
                    </span>
                  </div>
                ))}
              </div>
              <div 
                className={`${styles.nextButton} ${currentPage >= totalPages ? styles.disabled : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <span className={styles.nextText}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.xyy", "下一页")}</span>
              </div>
            </div>
            <div className={styles.goToPage}>
              <span className={styles.goToLabel}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.qw", "前往")}</span>
              <div className={styles.goToInput}>
                <InputNumber
                  className={styles.inputField}
                  value={jumpValue}
                  onChange={(value) => setJumpValue(value)}
                  onPressEnter={handleJumpToPage}
                  placeholder={$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.qinput", "请输入")}
                  controls={false}
                  min={1}
                />
                <div className={styles.confirmButton} onClick={handleJumpToPage}>{$t("global-1688-ai-app.select-product.ImproveComponents.PaginationComponent.qd", "确定")}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaginationComponent;
