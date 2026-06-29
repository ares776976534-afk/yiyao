import CommonTable from '@/components/ChatFlow/CommonTable';
import { observer } from 'mobx-react-lite';
import { ImproveKeywordAmazonTableColumns } from '../keywordTableConfig';
import { $t } from '@/i18n';

export const ImproveKeywordAmazonTable = observer((props: any) => {
  const { keywordList, excludeCols = [], platform } = props;
  const _columns = ImproveKeywordAmazonTableColumns(platform);
  if (keywordList?.[0]?.keywordCateDistribution?.length > 0) {
    _columns.push({
      title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveKeywordAmazonTable.krb", "关键词类目分布"),
      dataIndex: 'keywordCateDistribution',
      key: 'keywordCateDistribution',
      render: (value: any) => {
        return value.map((item: any) => (
          <p>
            {item}
          </p>
        ));
      },
    })
  }

  return (
    <CommonTable
      data={keywordList || []}
      columns={excludeCols ? _columns.filter((col) => !excludeCols.includes(col.key)) : _columns}
    />
  );
});