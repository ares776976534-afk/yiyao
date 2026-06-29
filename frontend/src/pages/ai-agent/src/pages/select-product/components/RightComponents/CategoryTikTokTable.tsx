import CommonTable from '@/components/ChatFlow/CommonTable';
import { observer } from 'mobx-react-lite';
import LiftData from '@/components/ChatFlow/LiftData';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.keyword", "关键词"),
    dataIndex: 'showKeyword',
    key: 'showKeyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.krdb", "关键词商品样本库"),
    dataIndex: 'salesInfo',
    key: 'salesInfo',
    children: [
      {
        title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.monthSales", "月销量"),
        dataIndex: 'soldCnt30d',
        key: 'soldCnt30d',
        render: (text, record) => {
          return (<div>
            <span>{record?.salesInfo?.soldCnt30d?.value}</span>
            <LiftData
              direction={record?.salesInfo?.soldCnt30d?.growthRate?.direction}
              text={record?.salesInfo?.soldCnt30d?.growthRate?.value}
            />
          </div>);
        },
      },
      {
        title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.monthxse", "月销售额"),
        dataIndex: 'soldCnt30d',
        key: 'soldCnt30d',
        render: (value, record) => {
          return (<div>
            <span>{record?.salesInfo?.soldAmt30d?.value?.amountWithSymbol}</span>
            <LiftData
              direction={record?.salesInfo?.soldAmt30d?.growthRate?.direction}
              text={record?.salesInfo?.soldAmt30d?.growthRate?.value}
            />
          </div>);
        },
      },
      {
        title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.pjprice", "平均价格"),
        dataIndex: 'profitInfo',
        key: 'profitInfo',
        render: (text, record) => {
          return (<span>{record?.profitInfo?.priceAvg
            ?.value?.amountWithSymbol}</span>);
        },
      },
      {
        title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.pjrating", "平均评分"),
        dataIndex: 'supplyInfo',
        key: 'supplyInfo',
        render: (text, record) => {
          return <span>{record?.supplyInfo?.ratingAvg?.value}</span>;
        },
      },
      {
        title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.zsproducts", "在售商品数"),
        dataIndex: 'supplyInfo',
        key: 'supplyInfo',
        render: (text, record) => {
          return <span>{record?.supplyInfo?.itemCount?.value}</span>;
        },
      },
      {
        title: $t("global-1688-ai-app.select-product.RightComponents.CategoryTikTokTable.Trt", "Top3商品成交占比"),
        dataIndex: 'supplyInfo',
        key: 'supplyInfo',
        render: (text, record) => {
          const value = record?.supplyInfo?.itemMonopolyCoefficient?.value;
          return (<span>
            {value}
          </span>);
        },
      },
    ],
  },
];

export const CategoryTikTokTable = observer((props: any) => {
  const { keywordList } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={columns}
    />
  );
});