import CommonTable from '@/components/ChatFlow/CommonTable';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.InputWordCateDistribution.keyword", "关键词"),
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.InputWordCateDistribution.keywordfb", "关键词分布"),
    dataIndex: 'keywordCateDistribution',
    key: 'keywordCateDistribution',
    render: (value: any) => {
      return value.map((item: any) => (
        <p>
          {item}
        </p>
      ));
    },
  },
];

export default (props: any) => {
  const { relatedWordList = [] } = props;

  return (
    <CommonTable data={relatedWordList} columns={columns} />
  );
};