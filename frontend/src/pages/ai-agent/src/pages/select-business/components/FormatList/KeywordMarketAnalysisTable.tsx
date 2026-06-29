import CommonTable from '@/components/ChatFlow/CommonTable';
import { TITLE_COLUMN, IMG_COLUMN } from '../../../select-product/components/RightComponents/columns';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.keyword", "关键词"),
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.oeu", "在线商品数"),
    dataIndex: 'activeProductCount',
    key: 'activeProductCount',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.pcs", "商品垄断系数"),
    dataIndex: 'top3SalesProductTransactionRate',
    key: 'top3SalesProductTransactionRate',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.ldah", "垄断商品销量总和"),
    dataIndex: 'top3SalesProductSales',
    key: 'top3SalesProductSales',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.brandldxs", "品牌垄断系数"),
    dataIndex: 'brandMonopolyRate',
    key: 'brandMonopolyRate',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.lne", "垄断品牌销量总和"),
    dataIndex: 'brandMonopolySales',
    key: 'brandMonopolySales',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.zgsellerzb", "中国卖家占比"),
    dataIndex: 'chinaSellerMonopolyRate',
    key: 'chinaSellerMonopolyRate',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.leSz", "垄断中国卖家销量总和"),
    dataIndex: 'chinaSellerMonopolySales',
    key: 'chinaSellerMonopolySales',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.jyrls", "近90天新品销量占比"),
    dataIndex: 'lst90dNewItemSalesPt',
    key: 'lst90dNewItemSalesPt',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.jyrls.2", "近90天新品销量"),
    dataIndex: 'lst90dNewItemSales',
    key: 'lst90dNewItemSales',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.jys", "销量"),
    dataIndex: 'monthlySalesVolume',
    key: 'monthlySalesVolume',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.j30dayxse", "近30天销售额"),
    dataIndex: 'monthlySalesAmount',
    key: 'monthlySalesAmount',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.KeywordMarketAnalysisTable.smprice", "售卖价格"),
    dataIndex: 'sellingPrice',
    key: 'sellingPrice',
  },
];

export const KeywordMarketAnalysisTable = (props: any) => {
  const { marketAnalysisList = [] } = props;

  return (
    <CommonTable data={marketAnalysisList} columns={columns} />
  );
};