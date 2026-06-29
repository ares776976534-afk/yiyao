import CommonTable from '@/components/ChatFlow/CommonTable';
import { TITLE_COLUMN, IMG_COLUMN } from '../../../components/RightComponents/columns';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import { $t } from '@/i18n';

export const ToolProductTable = (props: any) => {
  const { oppProductList = [] } = props;
  const columns = [
    IMG_COLUMN,
    TITLE_COLUMN,
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.gj", "国家"),
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.pt", "平台"),
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.lm", "类目"),
      dataIndex: 'catePath',
      key: 'catePath',
      width: 240,
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.sjtime", "上架时间"),
      dataIndex: 'onShelfDate',
      key: 'onShelfDate',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.sjy", "销量（近30天）"),
      dataIndex: 'soldCnt30d',
      key: 'soldCnt30d',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.ratingfs", "评分分数"),
      dataIndex: 'ratingRange',
      key: 'ratingRange',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.ratingts", "评分条数"),
      dataIndex: 'ratingCnt',
      key: 'ratingCnt',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.smprice", "售卖价格"),
      dataIndex: 'priceRange',
      key: 'priceRange',
    },
    {
      title: $t("global-1688-ai-app.inquiry.FormatList.ToolProductTable.tkquantity", "同款数量"),
      dataIndex: 'spItemCnt',
      key: 'spItemCnt',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    // {
    //   title: '五点描述',
    //   dataIndex: 'description',
    //   key: 'description',
    //   render: (text) => {
    //     return (<div>
    //       {text}
    //     </div>);
    //   },
    // },
  ];
  return (
    <CommonTable data={oppProductList} columns={columns} />
  );
};