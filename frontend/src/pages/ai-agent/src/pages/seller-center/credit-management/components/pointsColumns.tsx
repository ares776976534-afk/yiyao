import type { ColumnsType } from 'antd/es/table';

import { ApiRecord } from '../types';
import dayjs from 'dayjs';
import { $t } from '@/i18n';

export const pointsColumns: ColumnsType<ApiRecord> = [
  {
    title: 'Request ID',
    dataIndex: 'requestId',
    key: 'requestId',
    width: 229,
    align: 'center',
    fixed: 'left',
  },
  {
    title: $t("global-1688-ai-app.seller-center.credit-management.pointsColumns.APIservice", "API服务"),
    dataIndex: 'serviceName',
    key: 'serviceName',
    width: 229,
    align: 'center',
  },
  // {
  //   title: '分类',
  //   dataIndex: 'category',
  //   key: 'category',
  //   width: 229,
  //   align: 'center',
  //   render: (category: string) => {
  //     const isNLP = category === '自然语言处理';
  //     return (
  //       <Tag
  //         className={`${styles.categoryTag} ${isNLP ? styles.nlp : styles.image}`}
  //       >
  //         {category}
  //       </Tag>
  //     );
  //   },
  // },
  // {
  //   title: '请求时间',
  //   dataIndex: 'requestTime',
  //   key: 'requestTime',
  //   width: 281,
  //   align: 'center',
  // },
  {
    title: $t("global-1688-ai-app.seller-center.credit-management.pointsColumns.dcxhpoints", "单次消耗积分"),
    dataIndex: 'costValue',
    key: 'costValue',
    width: 229,
    align: 'center',
    render: (cost: number) => <strong>{cost}</strong>,
  },
  {
    title: $t("global-1688-ai-app.seller-center.credit-management.pointsColumns.psm", "积分扣减时间"),
    dataIndex: 'costTime',
    key: 'costTime',
    width: 281,
    align: 'center',
    render: (costTime: string) => dayjs(costTime).format('YYYY-MM-DD HH:mm:ss'),
  },
];