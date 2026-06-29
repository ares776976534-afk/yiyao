/**
 * 仅图搜表格组件 (ImageSearchTable)
 * 用于展示图片搜索结果的商品对比表格
 * @deprecated 已废弃，请使用 ProductSearchTable 组件(因为和以品找商一模一样)
 */

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TypeProductData, TypeImageSearchTableProps } from './types';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const ImageSearchTable: React.FC<TypeImageSearchTableProps> = ({
  dataSource = [],
  loading = false,
  pagination = false,
  onRowClick,
}) => {
  // 定义表格列
  const columns: ColumnsType<TypeProductData> = [
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.productInformation", "商品信息"),
      dataIndex: 'productInfo',
      key: 'productInfo',
      width: 240,
      fixed: 'left',
      render: (_, record) => (
        <div className={styles.productInfo}>
          <div className={styles.imageWrapper}>
            <img
              src={record.productImage}
              alt={record.productTitle}
              className={styles.productImage}
            />
            <div className={styles.rankBadge}>
              <span>{record.rank}</span>
            </div>
          </div>
          <div className={styles.productDetails}>
            <div className={styles.productTitle}>{record.productTitle}</div>
            <div className={styles.productPrice}>{record.productPrice}</div>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.gft", "供应商信息"),
      dataIndex: 'supplierInfo',
      key: 'supplierInfo',
      width: 200,
      render: (_, record) => (
        <div className={styles.supplierInfo}>
          <div className={styles.supplierName}>{record.supplierName}</div>
          <div className={styles.supplierTags}>
            {record.supplierTags.map((tag, index) => (
              <React.Fragment key={index}>
                {tag.type === 'badge' && tag.imageUrl && (
                  <img
                    src={tag.imageUrl}
                    alt={$t("global-1688-ai-app.select-business.ImageSearchTable.gyshz", "供应商徽章")}
                    className={styles.supplierBadge}
                  />
                )}
                {tag.type === 'factory' && tag.text && (
                  <span className={styles.factoryTag}>{tag.text}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className={styles.aiHeader}>
          <img
            src="https://img.alicdn.com/imgextra/i2/6000000006145/O1CN01HbN8i51vGSvNeU4eo_!!6000000006145-2-gg_dtc.png"
            alt="AI"
            className={styles.aiIcon}
          />
          <span className={styles.aiText}>{$t("global-1688-ai-app.select-business.ImageSearchTable.AIzl", "AI总览")}</span>
        </div>
      ),
      dataIndex: 'aiSummary',
      key: 'aiSummary',
      width: 200,
      render: (_, record) => (
        <div className={styles.aiSummary}>
          {record.aiSummary.map((item, index) => (
            <div key={index} className={styles.aiSummaryItem}>
              {item}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.jys", "销量"),
      dataIndex: 'sales',
      key: 'sales',
      width: 200,
      render: (_, record) => (
        <div className={styles.salesInfo}>
          <div className={styles.salesItem}>
            <span className={styles.salesLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.sales", "销量:")}</span>
            <span className={styles.salesValue}>{record.sales.salesVolume}</span>
          </div>
          <div className={styles.salesItem}>
            <span className={styles.salesLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.order", "订单:")}</span>
            <span className={styles.salesValue}>{record.sales.orderCount}</span>
          </div>
          <div className={styles.salesItem}>
            <span className={styles.salesLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.buyers", "买家数:")}</span>
            <span className={styles.salesValue}>{record.sales.buyerCount}</span>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.hre", "核心属性"),
      dataIndex: 'coreAttributes',
      key: 'coreAttributes',
      width: 200,
      render: (_, record) => (
        <div className={styles.coreAttributes}>
          {Object.entries(record.coreAttributes).map(([key, value]) => (
            <div key={key} className={styles.attrItem}>
              <span className={styles.attrLabel}>{key}:</span>
              <span className={styles.attrValue}>{value}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.coi", "采购信息"),
      dataIndex: 'purchaseInfo',
      key: 'purchaseInfo',
      width: 200,
      render: (_, record) => (
        <div className={styles.purchaseInfo}>
          <div className={styles.purchaseItem}>
            <span className={styles.purchaseLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.qbulk", "起批量:")}</span>
            <span className={styles.purchaseValue}>{record.purchaseInfo.minOrderQuantity}</span>
          </div>
          <div className={styles.purchaseItem}>
            <span className={styles.purchaseLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.service", "服务:")}</span>
            <span className={styles.purchaseValue}>{record.purchaseInfo.service}</span>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.shiply", "发货履约"),
      dataIndex: 'deliveryInfo',
      key: 'deliveryInfo',
      width: 200,
      render: (_, record) => (
        <div className={styles.deliveryInfo}>
          <div className={styles.deliveryItem}>
            <span className={styles.deliveryLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.shiplyl", "发货履约率:")}</span>
            <span className={styles.deliveryValue}>{record.deliveryInfo.fulfillmentRate}</span>
          </div>
          <div className={styles.deliveryItem}>
            <span className={styles.deliveryLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.48hourlsl", "48小时揽收率:")}</span>
            <span className={styles.deliveryValue}>{record.deliveryInfo.pickupRate}</span>
          </div>
          <div className={styles.deliveryItem}>
            <span className={styles.deliveryLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.shipd", "发货地:")}</span>
            <span className={styles.deliveryValue}>{record.deliveryInfo.location}</span>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ImageSearchTable.merchantService", "商家服务"),
      dataIndex: 'merchantService',
      key: 'merchantService',
      width: 695,
      render: (_, record) => (
        <div className={styles.merchantService}>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.qualityRefundRate}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.pzrefundl", "品质退款率")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.customerServiceResponseRate}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.cmrx", "客服响应率")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.repeatPurchaseRate90Days}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.90dayhtl", "90天回头率")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.comprehensiveServiceScore}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.zhservicef", "综合服务分")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.orders180Days}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.1yr", "180天订单")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.buyers180Days}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.1yr.2", "180天买家")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.totalProducts}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.qbproduct", "全部商品")}</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.newProducts30Days}</span>
            <span className={styles.serviceLabel}>{$t("global-1688-ai-app.select-business.ImageSearchTable.j30daysNew", "近30天上新")}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.imageSearchTable}>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        scroll={{ x: 2135 }}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
        })}
      />
    </div>
  );
};

export default ImageSearchTable;

