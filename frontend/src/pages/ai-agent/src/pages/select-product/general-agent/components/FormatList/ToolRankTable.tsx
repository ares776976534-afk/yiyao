import CommonTable from '@/components/ChatFlow/CommonTable';
import { IMG_COLUMN, TITLE_COLUMN } from '../../../components/RightComponents/columns';
import { $t } from '@/i18n';

const columns = [
  IMG_COLUMN,
  TITLE_COLUMN,
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.gj", "国家"),
    dataIndex: 'region',
    key: 'region',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.pt", "平台"),
    dataIndex: 'platform',
    key: 'platform',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.lm", "类目"),
    dataIndex: 'catePath',
    key: 'catePath',
    width: 240,
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.sjtime", "上架时间"),
    dataIndex: 'onShelfDate',
    key: 'onShelfDate',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.sjy", "销量（近30天）"),
    dataIndex: 'soldCnt30d',
    key: 'soldCnt30d',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.smprice", "售卖价格"),
    dataIndex: 'priceRange',
    key: 'priceRange',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolRankTable.tkproducts", "同款商品数"),
    dataIndex: 'spItemCnt',
    key: 'spItemCnt',
  }
];

export const ToolRankTable = (props: any) => {
  const { oppProductList = [] } = props;

  return (
    <CommonTable data={oppProductList} columns={columns} />
  );
};