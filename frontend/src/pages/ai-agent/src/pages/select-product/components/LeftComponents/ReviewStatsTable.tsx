import React, { useEffect, useState } from 'react';
import { Table, Progress, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './reviewStatsTable.module.css';
import { ChevronUpIcon } from '@/components/Icons';
import { $t } from '@/i18n';

interface ReviewStatsTableProps {
  data?: any;
  sentimentType?: string;
}

interface DataType {
  key: string;
  reviewPoint: string;
  percentage: number;
  reviewCount: number;
  isHighlight?: boolean;
}

const SENTIMENT_TYPE_MAP = {
  'positive': $t("global-1688-ai-app.select-product.LeftComponents.ReviewStatsTable.positiveReview", "好评"),
  'negative': $t("global-1688-ai-app.select-product.LeftComponents.ReviewStatsTable.negativeReview", "差评"),
};

export const ReviewStatsTable: React.FC<ReviewStatsTableProps> = ({ data, sentimentType = 'positive' }) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;
  const totalPages = data ? Math.ceil(data.length / pageSize) : 0;

  useEffect(() => {
    if (data && data.length > 0) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setDataSource(data.slice(startIndex, endIndex));
    }
  }, [data, currentPage]);

  const columns: ColumnsType<DataType> = [
    {
      title: (
        <div className={styles.title}>{$t("global-1688-ai-app.select-product.LeftComponents.ReviewStatsTable.d", `${SENTIMENT_TYPE_MAP[sentimentType]}点`, [SENTIMENT_TYPE_MAP[sentimentType]])}</div>
      ),
      dataIndex: 'reviewTag',
      key: 'reviewTag',
      width: '50%',
      render: (text: string) => (
        <span className={styles.reviewPointText}>{text}</span>
      ),
    },
    {
      title: (
        <div className={styles.titleContainer}>{$t("global-1688-ai-app.select-product.LeftComponents.ReviewStatsTable.zmlm", "占总评论比例及评论数")}</div>
      ),
      dataIndex: 'occupyRate',
      key: 'occupyRate',
      width: '50%',
      render: (percentage: number, record: any) => (
        <div className={styles.percentageContainer}>
          <div className={styles.percentageText}>{percentage}%（{record.reviewCnt}）</div>
          <Progress
            percent={percentage}
            showInfo={false}
            strokeColor="#22AC60"
            trailColor="#F3F4F6"
            strokeWidth={4}
            className={`${styles.progressBar} ${sentimentType === 'positive' ? styles.successProgressBar : styles.warningProgressBar}`}
          />
        </div>
      ),
    },
  ];
  const handleLeftClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleRightClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <div className={styles.tableWrapper} style={totalPages > 10 ? { minHeight: '600px' } : { minHeight: 'auto' }}>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="middle"
        className={styles.table}
      />
      {totalPages > 1 && (
        <div 
          className={styles.loadMoreWrapper} 
          style={dataSource.length === 10 ? {} : { borderTop: '1px solid var(--border-secondary)' }}
        >
          <div 
            className={`${styles.loadMoreIcon} ${styles.LeftIcon} ${currentPage === 1 ? styles.disabled : ''}`} 
            onClick={handleLeftClick}
          >
            <ChevronUpIcon size={12} />
          </div>
          <div className={styles.loadMoreText}>{currentPage}/{totalPages}</div>
          <div 
            className={`${styles.loadMoreIcon} ${styles.RightIcon} ${currentPage === totalPages ? styles.disabled : ''}`} 
            onClick={handleRightClick}
          >
            <ChevronUpIcon size={12} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStatsTable;
