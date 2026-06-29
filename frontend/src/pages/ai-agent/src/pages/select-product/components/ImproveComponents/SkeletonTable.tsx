import { Table } from 'antd';
import PaginationComponent from './PaginationComponent';
import style from './reviewDetailModal.module.css';
import { useRef } from 'react';


export const SkeletonTable = ({
  loading, list, pageSize, total, open, columns, skeletonColumns,
  generateSkeletonData, onPageChange, currentPage, maxHeight = '60vh', footerName
}: {
  loading: boolean, list: any[], pageSize: number, total: number,
  open: boolean, columns: any[], skeletonColumns: any[],
  generateSkeletonData: (count: number) => any[],
  onPageChange?: (page: number, pageSize: number) => void, currentPage?: number, maxHeight?: string, footerName?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
 
  const onChange = (page: number, pageSize: number) => {
    onPageChange?.(page, pageSize);
  };
  return (
    <>
      <div
        ref={scrollRef}
        className={`${style.reviewDetailModalTableContainer} reviewTable`}
        style={{ maxHeight }}
      >
        <Table
          columns={loading ? skeletonColumns : columns}
          dataSource={loading ? generateSkeletonData(8) : list}
          pagination={false}
          loading={false}
          sticky
          scroll={{ x: 'max-content' }}
        />
      </div>
      <PaginationComponent 
        key={open ? 'open' : 'closed'} 
        current={currentPage || 1} 
        pageSize={pageSize} 
        total={total} 
        onChange={onChange} 
        footerName={footerName}
      />
    </>
  );
};