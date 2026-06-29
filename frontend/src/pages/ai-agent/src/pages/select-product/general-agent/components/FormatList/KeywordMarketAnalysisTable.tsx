import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.keyword", "关键词"),
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.oeu", "在线商品数"),
    dataIndex: 'activeProductCount',
    key: 'activeProductCount',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.pcs", "商品垄断系数"),
    dataIndex: 'top5SalesProductTransactionRate',
    key: 'top5SalesProductTransactionRate',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.pca", "商品垄断销量"),
    dataIndex: 'top5SalesProductSales',
    key: 'top5SalesProductSales',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.brandldxs", "品牌垄断系数"),
    dataIndex: 'top3BrandMonopolyRate',
    key: 'top3BrandMonopolyRate',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.ble", "品牌垄断销量"),
    dataIndex: 'top3BrandMonopolySales',
    key: 'top3BrandMonopolySales',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.zgsellerzb", "中国卖家占比"),
    dataIndex: 'chineseSellerRate',
    key: 'chineseSellerRate',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.zll", "中国卖家销量占比"),
    dataIndex: 'chineseSellerSalesVolumeRate',
    key: 'chineseSellerSalesVolumeRate',
  },
  // {
  //   title: '近90天新品销量占比',
  //   dataIndex: 'lst90dNewItemSalesPt',
  //   key: 'lst90dNewItemSalesPt',
  // },
  // {
  //   title: '近90天新品销量',
  //   dataIndex: 'lst90dNewItemSales',
  //   key: 'lst90dNewItemSales',
  // },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.monthSales", "月销量"),
    dataIndex: 'lst30dSalesVolume',
    key: 'lst30dSalesVolume',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.mSh", "月销量环比"),
    dataIndex: 'soldCntLst30dCir',
    key: 'soldCntLst30dCir',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.monthxse", "月销售额"),
    dataIndex: 'lst30dSalesAmount',
    key: 'lst30dSalesAmount',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.monthsehb", "月售额环比"),
    dataIndex: 'soldAmtLst30dCir',
    key: 'soldAmtLst30dCir',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.mSq", "月销量趋势"),
    dataIndex: 'lst30dSalesVolumeTrend',
    key: 'lst30dSalesVolumeTrend',
    render: (value) => {
      if (value.length > 0) {
        return (<div>
          <LineChart
            reflect={value?.reflect || true}
            data={value || []}
            toolTipYName={$t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.monthSales", "月销量")}
          />
        </div>
        );
      } else {
        return '-';
      }
    },
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.pca.2", "商品平均评分"),
    dataIndex: 'productAverageRating',
    key: 'productAverageRating',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordMarketAnalysisTable.xdji", "下游商品平均售卖价格"),
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