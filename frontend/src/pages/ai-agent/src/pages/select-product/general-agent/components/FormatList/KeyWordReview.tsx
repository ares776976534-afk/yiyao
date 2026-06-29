import CommonTable from '@/components/ChatFlow/CommonTable';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyWordReview.keyword", "关键词"),
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyWordReview.pjrating", "平均评分"),
    dataIndex: 'scoreAvg',
    key: 'scoreAvg',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyWordReview.comments", "评论数"),
    dataIndex: 'ratingCntAvg',
    key: 'ratingCntAvg',
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyWordReview.fis", "负面评价列表"),
    dataIndex: 'keywordNegativeReviewTagVOList',
    key: 'keywordNegativeReviewTagVOList',
    render: (value: any) => {
      return value?.length > 0 ? value?.map((item: any) => `${item?.labelName}(${item?.percentOfAllReviews}%)`).join('、') : '-';
    },
    width: 300,
  },
  {
    title: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeyWordReview.zis", "正面评价列表"),
    dataIndex: 'keywordPositiveReviewTagVOList',
    key: 'keywordPositiveReviewTagVOList',
    render: (value: any) => {
      return value?.length > 0 ? value?.map((item: any) => `${item?.labelName}(${item?.percentOfAllReviews}%)`).join('、') : '-';
    },
    width: 300,
  },
];

export default (props: any) => {
  const { keywordReviewList = [] } = props;

  return (
    <CommonTable data={keywordReviewList} columns={columns} />
  );
};