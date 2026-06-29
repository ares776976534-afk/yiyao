import type { ColumnsType } from 'antd/es/table';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { $t } from '@/i18n';

const formatContextLength = (val: number) => {
  if (!val) return '-';
  if (val >= 1000) return `${Math.round(val / 1000)}K`;
  return String(val);
};

const contextColorMap: Record<string, string> = {
  '32K': '#E8F5E9',
  '128K': '#E3F2FD',
  '252K': '#F3E5F5',
};

export const llmColumns: ColumnsType<any> = [
  {
    title: 'Request ID',
    dataIndex: 'requestId',
    key: 'requestId',
    align: 'center',
    width: 200,
    fixed: 'left',
  },
  {
    title: $t('global-1688-ai-app.seller-center.credit-management.llmColumns.model', '模型/服务'),
    dataIndex: 'serviceName',
    key: 'serviceName',
    align: 'center',
    width: 180,
    render: (text: string, record: any) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tag color="blue" style={{ margin: 0 }}>{text}</Tag>
        {record.serviceAlias && <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{record.serviceAlias}</span>}
      </div>
    ),
  },
  {
    title: $t('global-1688-ai-app.seller-center.credit-management.llmColumns.callTime', '调用时间'),
    dataIndex: 'costTime',
    key: 'costTime',
    align: 'center',
    width: 180,
    render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: $t('global-1688-ai-app.seller-center.credit-management.llmColumns.costValue', '消耗积分'),
    dataIndex: 'costValue',
    key: 'costValue',
    align: 'center',
    width: 100,
    render: (val: number) => <strong>{val}</strong>,
  },
  // {
  //   title: $t('global-1688-ai-app.seller-center.credit-management.llmColumns.contextLength', '上下文长度'),
  //   dataIndex: 'contextLength',
  //   key: 'contextLength',
  //   align: 'center',
  //   width: 120,
  //   render: (val: number) => {
  //     const label = formatContextLength(val);
  //     const bg = contextColorMap[label] || '#F5F5F5';
  //     return <Tag style={{ background: bg, border: 'none', borderRadius: 4 }}>{label}</Tag>;
  //   },
  // },
  // {
  //   title: $t('global-1688-ai-app.seller-center.credit-management.llmColumns.inputToken', '输入Token'),
  //   dataIndex: 'inputToken',
  //   key: 'inputToken',
  //   align: 'center',
  //   width: 100,
  // },
  // {
  //   title: $t('global-1688-ai-app.seller-center.credit-management.llmColumns.outputToken', '输出Token'),
  //   dataIndex: 'outputToken',
  //   key: 'outputToken',
  //   align: 'center',
  //   width: 100,
  // },
];
