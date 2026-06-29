import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.CateGoogleTable.keyword", "关键词"),
    dataIndex: 'showKeyword',
    key: 'showKeyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.CateGoogleTable.shn1n", "搜索峰值月（最近12个月）"),
    dataIndex: 'searchVolume',
    key: 'searchVolume',
  },
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.CateGoogleTable.krrjo", "关键词搜索趋势（近12个月）"),
    dataIndex: 'trends',
    key: 'trends',
    render: (value, record) => {
      if (value?.length > 0) {
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

export const CateGoogleTable = (props: any) => {
  const { keywordList } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={columns}
    />
  );
};