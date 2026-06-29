import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { $t } from '@/i18n';

const platformMap = {
  amazon: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.ymx", "亚马逊"),
  tiktok: 'TikTok'
}
export default (props: any) => {
  const { keywordDetailList = [] } = props;
  const platform = keywordDetailList[0]?.amazonSearchHeatVO?.platform
  const columns = [
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.keyword", "关键词"),
      dataIndex: 'keyword',
      key: 'keyword',
    },
    platform !== 'tiktok' && {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.yam", `亚马逊搜索排名`),
      dataIndex: 'amazonSearchHeatVO',
      key: 'amazonRanking',
      render: (value: any) => {
        return value?.amazonRanking;
      },
    },
    platform !== 'tiktok' && {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.ymxqsdata", `亚马逊趋势数据`),
      dataIndex: 'amazonSearchHeatVO',
      key: 'amazonTrendData',
      render: (value: any) => {
        return <LineChart
          data={value?.amazonTrendData?.map(item => {
            return { x: item.timePoint, y: item.value };
          })}
        />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.krm", "关键词核心类目分布"),
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
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.zsproducts", "在售商品数"),
      dataIndex: 'marketAnalysisInfo',
      key: 'activeProductCount',
      render: (value: any) => {
        return value?.activeProductCount;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.zgsellerzb", "中国卖家占比"),
      dataIndex: 'marketAnalysisInfo',
      key: 'chineseSellerRate',
      render: (value: any) => {
        return value?.chineseSellerRate;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.jaaae", "近180天新品销量占比"),
      dataIndex: 'marketAnalysisInfo',
      key: 'lst180dNewItemSalesPt',
      render: (value: any) => {
        return value?.lst180dNewItemSalesPt;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.monthxse", "月销售额"),
      dataIndex: 'marketAnalysisInfo',
      key: 'lst30dSalesAmount',
      render: (value: any) => {
        return value?.lst30dSalesAmount;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.monthSales", "月销量"),
      dataIndex: 'marketAnalysisInfo',
      key: 'lst30dSalesVolume',
      render: (value: any) => {
        return value?.lst30dSalesVolume;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.mSq", "月销量趋势"),
      dataIndex: 'marketAnalysisInfo',
      key: 'lst30dSalesVolumeTrend',
      render: (value: any) => {
        return <LineChart data={value?.lst30dSalesVolumeTrend} reflect={value?.reflect || true} />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.pca", "商品平均评分"),
      dataIndex: 'marketAnalysisInfo',
      key: 'productAverageRating',
      render: (value: any) => {
        return value?.productAverageRating;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.smprice", "售卖价格"),
      dataIndex: 'marketAnalysisInfo',
      key: 'sellingPrice',
      render: (value: any) => {
        return value?.sellingPrice;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.monthxsehb", "月销售额环比"),
      dataIndex: 'marketAnalysisInfo',
      key: 'soldAmtLst30dCir',
      render: (value: any) => {
        return value?.soldAmtLst30dCir;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.mSh", "月销量环比"),
      dataIndex: 'marketAnalysisInfo',
      key: 'soldCntLst30dCir',
      render: (value: any) => {
        return value?.soldCntLst30dCir;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.brandldxs", "品牌垄断系数"),
      dataIndex: 'marketAnalysisInfo',
      key: 'top3BrandMonopolyRate',
      render: (value: any) => {
        return value?.top3BrandMonopolyRate;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.pcs", "商品垄断系数"),
      dataIndex: 'marketAnalysisInfo',
      key: 'top5SalesProductTransactionRate',
      render: (value: any) => {
        return value?.top5SalesProductTransactionRate;
      },
    },
  ].filter(Boolean);
  return (
    <CommonTable data={keywordDetailList} columns={columns} />
  );
};