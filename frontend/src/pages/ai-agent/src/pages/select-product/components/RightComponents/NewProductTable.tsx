import CommonTable from '@/components/ChatFlow/CommonTable';
import LiftData from '@/components/ChatFlow/LiftData';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { TITLE_COLUMN, IMG_COLUMN, IMG_COLUMN_WITH_LOG } from './columns';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import { $t } from '@/i18n';

export const NewProductTable = (props: any) => {
  const { oppProductList = [], isProduct, oppScoreDesc, imgClickLogKey } = props;
  const columns = [
    imgClickLogKey ? IMG_COLUMN_WITH_LOG(imgClickLogKey) : IMG_COLUMN,
    TITLE_COLUMN,
    {
      title: (
        <div>
          <span className="mr-1">{$t("global-1688-ai-app.select-product.RightComponents.NewProductTable.nrj", "新品机会分")}</span>
          <Tooltip title={oppScoreDesc}>
            <QuestionCircleOutlined />
          </Tooltip>
        </div>
      ),
      dataIndex: 'newProductOppScore',
      key: 'newProductOppScore',
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.NewProductTable.tks", "同款数"),
      dataIndex: 'spItemCnt',
      key: 'spItemCnt',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.NewProductTable.sjtime", "上架时间"),
      dataIndex: 'onShelfDate',
      key: 'onShelfDate',
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.NewProductTable.lm", "类目"),
      dataIndex: 'catePath',
      key: 'catePath',
      width: 240,
    },
    {
      title: `${isProduct ? $t("global-1688-ai-app.ChatFlow.ComparedDetailTable.price", "价格") : $t("global-1688-ai-app.ChatFlow.ComparedDetailTable.pricefw", "价格范围")}`,
      dataIndex: 'priceRange',
      key: 'priceRange',
    },
    {
      title: `${isProduct ? $t("global-1688-ai-app.ChatFlow.ProductDetailTable.pjrating", "平均评分") : $t("global-1688-ai-app.ChatFlow.ProductDetailTable.ratingfw", "评分范围")}`,
      dataIndex: 'ratingRange',
      key: 'ratingRange',
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.NewProductTable.pcnlgh", "商品总月销量（近1个月）"),
      dataIndex: 'soldCnt30d',
      key: 'soldCnt30d',
      render: (text, record) => {
        return (<div>
          <LiftData
            direction={record?.soldCnt30dMom?.direction}
            text={record?.soldCnt30dMom?.value}
          />
          {text}
        </div>);
      },
    },
  ];
  return (
    <CommonTable data={oppProductList} columns={columns} />
  );
};
