import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';

// 关键词文本截断样式
const keywordTruncateStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-all' as const,
  lineHeight: '1.4',
  maxHeight: '2.8em',
};
const columns = [
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.KeywordGoogleTable.keyword", "关键词"),
    dataIndex: 'showKeyword',
    key: 'showKeyword',
    render: (value, record) => {
      return (
        <div>
          <div>
            {value.length > 74 ? (
              <Tooltip title={value} placement="top">
                <div style={keywordTruncateStyle}>{value}</div>
              </Tooltip>
            ) : (
              value
            )}
          </div>
          <div>
            {record?.keywordCn?.length > 32 ? (
              <Tooltip title={record?.keywordCn} placement="top">
                <div style={keywordTruncateStyle}>{record?.keywordCn}</div>
              </Tooltip>
            ) : (
              record?.keywordCn
            )}
          </div>
        </div>
      );
    },
  },
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.KeywordGoogleTable.shn1n", "搜索峰值月（最近12个月）"),
    dataIndex: 'searchVolume',
    key: 'searchVolume',
  },
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.KeywordGoogleTable.krrjo", "关键词搜索趋势（近12个月）"),
    dataIndex: 'trends',
    key: 'trends',
    width: '200px',
    render: (value, record) => {
      if (value && value.length > 0) {
        return (<div>
          <LineChart
            data={value || []}
            reflect={record?.trendsIsBiggerHigher}
            toolTipYName={record?.trendsPointName}
          />
        </div>);
      } else {
        return '-';
      }
    },
  },
];

export const KeywordGoogleTable = (props: any) => {
  const { keywordList } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={columns}
    />
  );
};