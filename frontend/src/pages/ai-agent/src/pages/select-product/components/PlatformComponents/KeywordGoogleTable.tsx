import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { $t } from '@/i18n';

const googleTrendsColumns = [
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.KeywordGoogleTable.keyword", "关键词"),
    dataIndex: 'showKeyword',
    key: 'showKeyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.KeywordGoogleTable.shgh", "搜索峰值月（最近12个月）"),
    dataIndex: 'searchVolume',
    key: 'searchVolume',
  },
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.KeywordGoogleTable.krrsM", "关键词搜索趋势（近12个月）"),
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
      columns={googleTrendsColumns}
    />
  );
};