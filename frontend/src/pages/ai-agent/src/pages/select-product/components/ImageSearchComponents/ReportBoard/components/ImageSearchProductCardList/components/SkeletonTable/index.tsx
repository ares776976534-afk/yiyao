import { Table } from "antd";
import PaginationComponent from "../PaginationComponent";
import style from "./index.module.css";
import { useRef } from "react";

// 骨架屏列配置
export const skeletonColumns = [
  {
    title: "SKU图片",
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 100,
    render: () => <div className={style.skeletonLine} style={{ height: '60px', width: '80%' }} />,
  },
  {
    title: "SKU ID",
    dataIndex: 'skuId',
    key: 'skuId',
    width: 150,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />,
  },
  {
    title: "SKU",
    dataIndex: 'title',
    key: 'title',
    width: 240,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />,
  },
  {
    title: 'SKU月销量',
    dataIndex: 'sold30d',
    key: 'sold30d',
    width: 120,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />,
  },
  {
    title: "SKU月销售额",
    dataIndex: 'sold30dAmt',
    key: 'sold30dAmt',
    width: 120,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />,
  },
  {
    title: "SKU评分",
    dataIndex: 'ratingScore',
    key: 'ratingScore',
    width: 100,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />,
  },
  {
    title: "SKU上架时间",
    dataIndex: 'launchDate',
    key: 'launchDate',
    width: 154,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />,
  },
];

export const SkeletonTable = ({
  loading,
  list,
  pageSize,
  total,
  open,
  columns,
  // skeletonColumns,
  generateSkeletonData,
  onPageChange,
  currentPage,
  maxHeight = "60vh",
  footerName,
}: {
  loading: boolean;
  list: any[];
  pageSize: number;
  total: number;
  open: boolean;
  columns: any[];
  // skeletonColumns: any[];
  generateSkeletonData: (count: number) => any[];
  onPageChange?: (page: number, pageSize: number) => void;
  currentPage?: number;
  maxHeight?: string;
  footerName?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const onChange = (page: number, pageSizeValue: number) => {
    onPageChange?.(page, pageSizeValue);
  };

  return (
    <>
      <div
        ref={scrollRef}
        className={style.reviewDetailModalTableContainer}
        style={{ maxHeight }}
      >
        <Table
          columns={loading ? skeletonColumns : columns}
          dataSource={loading ? generateSkeletonData(8) : list}
          pagination={false}
          loading={false}
          sticky
          scroll={{ x: "max-content" }}
        />
      </div>
      <PaginationComponent
        key={open ? "open" : "closed"}
        current={currentPage || 1}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        footerName={footerName}
      />
    </>
  );
};
