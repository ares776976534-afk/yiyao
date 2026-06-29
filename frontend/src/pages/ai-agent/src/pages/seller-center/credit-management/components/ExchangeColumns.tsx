import type { ColumnsType } from 'antd/es/table';
import { $t } from '@/i18n';

export const exchangeColumns: ColumnsType<any> = [
  {
    title: 'Request ID',
    dataIndex: 'requestId',
    key: 'requestId',
    align: 'center',
    width: 240,
  },
  {
    title: $t("global-1688-ai-app.seller-center.credit-management.ExchangeColumns.APIservice", "API服务"),
    dataIndex: 'serviceName',
    key: 'serviceName',
    align: 'center',
    width: 200,
  },
  {
    title: $t("global-1688-ai-app.seller-center.credit-management.ExchangeColumns.xhedtime", "消耗额度时间"),
    dataIndex: 'costTime',
    key: 'costTime',
    align: 'center',
    width: 220,
  },
  {
    title: $t("global-1688-ai-app.seller-center.credit-management.ExchangeColumns.dcxhzfs", "单次消耗字符数"),
    dataIndex: 'costValue',
    key: 'costValue',
    align: 'center',
    width: 180,
  },
];