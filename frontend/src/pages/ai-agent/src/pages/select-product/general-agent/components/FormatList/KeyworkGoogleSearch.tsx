import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyworkGoogleSearch.keyword", "关键词"),
    dataIndex: 'showKeyword',
    key: 'showKeyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyworkGoogleSearch.krrsM", "关键词搜索量趋势（近12个月）"),
    dataIndex: 'trends',
    key: 'trends',
    render: (value, record) => {
      if (value && value.length > 0) {
        return (<div>
          <LineChart
            data={value || []}
            toolTipYName={$t("global-1688-ai-app.select-product.general-agent.FormatList.KeyworkGoogleSearch.searchl", "搜索量")}
          />
        </div>);
      } else {
        return '-';
      }
    },
  },
];

export default (props: any) => {
  const { keywordList } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={columns}
    />
  );
};