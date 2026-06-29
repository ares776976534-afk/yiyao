import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.module.css';
import SpinData from '@/components/ChatFlow/SpinData';
import LiftData from '@/components/ChatFlow/LiftData';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';

interface ProductData {
  text: string;
  key: string;
  image: string;
  similarCount: number;
  topProduct: {
    title: string;
    link: string;
  };
  launchDate: string;
  priceRange: string;
  ratingRange: string;
  monthlySales: {
    count: string;
    growth: string;
    isPositive: boolean;
  };
  isCategory?: boolean;
  categoryInfo?: string;
  isTopProducts?: boolean;
  isLoading?: boolean;
  platform?: string;
  region?: string;
  spId?: string;
  spInfo?:{
    spId?: string;
  }
  riskStatus?: string;
  productUrl?: string;
}

interface ProductDetailModalProps {
  data: ProductData[];
}

const MigratedDetailTable: React.FC<ProductDetailModalProps> = ({ data }) => {
  const columns: ColumnsType<ProductData> = [
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.productImage", "商品图片"),
      dataIndex: 'image',
      key: 'image',
      width: 100,
      align: 'center',
      render: (image: string, record) => {
        if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
          return null;
        }
        return (
          <FrostedGlass
            style={{ width: 60, height: 60 }}
            riskStatus={record?.riskStatus}
            productUrl={record?.productUrl || ''}
            imageUrl={image}
          />
        );
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.tks", "同款数"),
      dataIndex: 'similarCount',
      key: 'similarCount',
      width: 212,
      align: 'center',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.sztd", "销量最高同款商品"),
      dataIndex: 'topProduct',
      key: 'topProduct',
      width: 200,
      render: (topProduct: any, record) => {
        if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
          return null;
        }
        return (
          topProduct.title?.length < 40 ? (
            <div className={styles.itemTitle}>{topProduct.title}</div>
          ) : (
            <Tooltip title={topProduct.title}>
              <div className={styles.itemTitle}>
                <img src={imgIcon[4]} alt={$t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.link", "链接")} className={styles.titleImageUrl} onClick={() => window.open(topProduct.link, '_blank')} />
                {topProduct.title}
              </div>
            </Tooltip>
          )
        );
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.sjtime", "上架时间"),
      dataIndex: 'launchDate',
      key: 'launchDate',
      width: 212,
      render: (date: string, record) => {
        if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
          return null;
        }
        return <span>{date}</span>;
      },
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.ComparedDetailTable.pricefw", "价格范围"),
      dataIndex: 'priceRange',
      key: 'priceRange',
      width: 212,
      align: 'center',
      render: (range: string, record) => {
        if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
          return null;
        }
        return <span>{range}</span>;
      },
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.ProductDetailTable.ratingfw", "评分范围"),
      dataIndex: 'ratingRange',
      key: 'ratingRange',
      width: 212,
      align: 'center',
      render: (range: string, record) => {
        if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
          return null;
        }
        return <span>{range}</span>;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.pcnlgh", "商品总月销量（近1个月）"),
      dataIndex: 'monthlySales',
      key: 'monthlySales',
      width: 212,
      align: 'center',
      render: (sales: any, record) => {
        if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
          return null;
        }
        return (
          <div className={styles.salesContainer}>
            <span className={styles.salesNumber}>{sales.count}</span>
            {sales.direction && <LiftData direction={sales.direction} text={sales.growth} />}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      className={styles.customTable}
      rowClassName={(record) => {
        if (record?.isCategory) return styles.categoryRow;
        if (record?.isTopProducts) return styles.topProductsRow;
        if (record?.isLoading) return styles.loadingRow;
        return styles.productRow;
      }}
      scroll={{ x: 'max-content' }}
      components={{
        body: {
          row: ({ className, children, ...restProps }) => {
            const record = restProps['data-row-key']
              ? data.find(item => item.key === restProps['data-row-key']) : null;
            console.log(record, 'record');
            if (record?.isCategory) {
              return (
                <tr className={className} {...restProps}>
                  <td colSpan={7} className={styles.categoryCell}>
                    <span className={styles.categoryTitle}>
                      {record?.text}
                    </span>
                  </td>
                </tr>
              );
            }

            if (record?.isTopProducts) {
              return (
                <tr className={className} {...restProps}>
                  <td colSpan={7} className={styles.topProductsCell}>
                    <span>
                      {record?.text}
                    </span>
                  </td>
                </tr>
              );
            }

            if (record?.isLoading) {
              return (
                <tr className={className} {...restProps}>
                  <td colSpan={7} className={styles.loadingCell}>
                    <div className={styles.loadingContent}>
                      <SpinData spinning text={$t("global-1688-ai-app.select-product.PlatformComponents.MigratedDetailTable.zzcz", "正在查找")} direction="right" />
                    </div>
                  </td>
                </tr>
              );
            }

            return <tr className={className} {...restProps}>{children}</tr>;
          },
        },
      }}
    />
  );
};

export default MigratedDetailTable;
