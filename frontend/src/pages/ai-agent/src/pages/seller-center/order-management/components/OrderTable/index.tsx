import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { OrderData, OrderTableProps, ORDER_STATUS } from '../../types';
import styles from './index.module.css';
import { $t } from '@/i18n';

const OrderTable: React.FC<OrderTableProps> = ({ dataSource = [] }) => {

  const getPackageTag = (packageName: string): JSX.Element => {
    const tagClassMap: Record<string, string> = {
      '入门版': styles.tagEntry,
      '专业版': styles.tagProfessional,
      '定制版': styles.tagCustom,
      '高级版': styles.tagAdvanced
    };

    const tagClass = tagClassMap[packageName] || styles.tagEntry;

    return (
      <span className={`${styles.tag} ${tagClass}`}>
        {packageName}
      </span>
    );
  };

  const getStatusText = (status: OrderData['status']): JSX.Element => {
    const statusClassMap: Record<OrderData['status'], string> = {
      [ORDER_STATUS.TO_PAY]: styles.statusPending,
      [ORDER_STATUS.TO_EFFECTIVE]: styles.statusPending,
      [ORDER_STATUS.EFFECTIVED]: styles.statusPaid,
      [ORDER_STATUS.EXPIRED]: styles.statusClosed,
      [ORDER_STATUS.CANCELLED]: styles.statusClosed
    };

    const statusTextMap: Record<OrderData['status'], string> = {
      [ORDER_STATUS.TO_PAY]: $t("global-1688-ai-app.seller-center.order-management.OrderTable.dpayment", "待支付"),
      [ORDER_STATUS.TO_EFFECTIVE]: $t("global-1688-ai-app.seller-center.order-management.OrderTable.dsx", "待生效"),
      [ORDER_STATUS.EFFECTIVED]: $t("global-1688-ai-app.seller-center.order-management.OrderTable.ysx", "已生效"),
      [ORDER_STATUS.EXPIRED]: $t("global-1688-ai-app.seller-center.order-management.OrderTable.expired", "已过期"),
      [ORDER_STATUS.CANCELLED]: $t("global-1688-ai-app.seller-center.order-management.OrderTable.cancelled", "已取消")
    };

    const statusClass = statusClassMap[status];
    const statusText = statusTextMap[status];

    return (
      <span className={statusClass}>
        {statusText}
      </span>
    );
  };

  const getActionButton = (status, record): JSX.Element => {
    if (status === ORDER_STATUS.TO_PAY) {
      return (
        <a className={styles.actionLink} href={`https://air.1688.com/app/ctf-page/payment-cashier-pc-air/cashier.html?alipayAction=single_trade_payment&fromType=make_order&orderId=${record?.orderId}&userType=buyer&tradeType=50060`} target="_blank">{$t("global-1688-ai-app.seller-center.order-management.OrderTable.qpayment", "去支付")}</a>
      );
    }
    return (
      <span className={styles.actionDisabled}>
        -
      </span>
    );
  };

  const columns: ColumnsType<OrderData> = [
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.orderID", "订单ID"),
      dataIndex: 'orderId',
      key: 'orderId',
      width: 166,
      align: 'center',
      fixed: 'left',
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.tclx", "套餐类型"),
      dataIndex: 'packageType',
      key: 'packageType',
      width: 166,
      align: 'center',
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.tcmc", "套餐名称"),
      dataIndex: 'packageName',
      key: 'packageName',
      width: 166,
      align: 'center',
      // render: (text: string) => getPackageTag(),
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.zy", "资源"),
      dataIndex: 'resourceList',
      key: 'points',
      width: 166,
      align: 'center',
      render: (resourceList: any[]) => {
        return (
          <div className={styles.resourceList}>
            {
              resourceList.map((item) => (
                <span key={item}>{item}</span>
              ))
            }
          </div>
        );
      },
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.amount", "金额"),
      dataIndex: 'payFee',
      key: 'dealPrice',
      width: 166,
      align: 'center',
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.placeorderTime", "下单时间"),
      dataIndex: 'createTime',
      key: 'orderTime',
      width: 166,
      align: 'center',
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.expirationTime", "过期时间"),
      dataIndex: 'expiredTime',
      key: 'expireTime',
      width: 166,
      align: 'center',
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.zt", "状态"),
      dataIndex: 'status',
      key: 'status',
      width: 166,
      align: 'center',
      render: (status: OrderData['status']) => getStatusText(status),
    },
    {
      title: $t("global-1688-ai-app.seller-center.order-management.OrderTable.cz", "操作"),
      dataIndex: 'status',
      key: 'action',
      width: 166,
      align: 'center',
      fixed: 'right',
      render: (status, record) => getActionButton(status, record),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      className={styles.table}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default OrderTable;