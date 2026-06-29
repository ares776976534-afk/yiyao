import CommonTable from '@/components/ChatFlow/CommonTable';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';

const POSITIVE = $t("global-1688-ai-app.select-business.FormatList.OriginalReview.positiveReview", "好评");
const NEGATIVE = $t("global-1688-ai-app.select-business.FormatList.OriginalReview.negativeReview", "差评");

const REVIEW_LABEL_MAP = {
  'POSITIVE': POSITIVE,
  'NEGATIVE': NEGATIVE,
};

const columns = [
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.productTitle", "商品标题"),
    dataIndex: 'productTitle',
    key: 'title',
    width: 200,
    render: (text, record) => {
      return (
        text?.length < 40 ? (
          <div
            className="cursor-pointer hover:text-blue-500 line-clamp-2 text-sm text-gray-800 w-44 leading-snug"
            onClick={() => window.open(record?.productUrl, '_blank')}
          >{text}</div>
        ) : (
          <Tooltip title={text}>
            <div
              className="cursor-pointer hover:text-blue-500 line-clamp-2 text-sm text-gray-800 w-44 leading-snug"
              onClick={() => window.open(record?.productUrl, '_blank')}
            >
              {text}
            </div>
          </Tooltip>
        )
      );
    },
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.commentTitle", "评论标题"),
    dataIndex: 'reviewTitleOri',
    key: 'reviewTitleOri',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.commentys", "评论原声"),
    dataIndex: 'reviewContentOri',
    key: 'reviewContentOri',
    width: 300,
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.commentTag", "评论标签"),
    dataIndex: 'reviewLabel',
    key: 'reviewLabel',
    render: (text, { reviewLabel = [] }) => {
      const _reviewLabel = Array.isArray(reviewLabel) ? reviewLabel : [];
      return (
        <div className="flex flex-col gap-[6px]">
          {_reviewLabel?.map((item: any) => (
            <span key={item?.labelName}>{item?.labelCategory}：{item?.labelName}</span>
          ))}
        </div>
      );
    },
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.cna", "评论情感标签"),
    dataIndex: 'reviewLabel',
    render: (text, { reviewLabel = [] }) => {
      const _reviewLabel = Array.isArray(reviewLabel) ? reviewLabel : [];
      return (
        <div className="flex flex-col gap-[6px]">
          {_reviewLabel?.map((item: any) => (
            <span key={item?.labelName}>{REVIEW_LABEL_MAP[item?.sentiment]}</span>
          ))}
        </div>
      );
    },
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.commentTime", "评论时间"),
    dataIndex: 'reviewTime',
    key: 'reviewTime',
  },
  {
    title: $t("global-1688-ai-app.select-business.FormatList.OriginalReview.ratingfs", "评分分数"),
    dataIndex: 'reviewScore',
    key: 'reviewScore',
  },
];

export const OriginalReview = (props: any) => {
  const { toolReviewDetailVOList = [] } = props;

  return (
    <CommonTable data={toolReviewDetailVOList} columns={columns} />
  );
};