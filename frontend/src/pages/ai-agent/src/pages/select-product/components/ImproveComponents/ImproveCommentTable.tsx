import CommonTable from '@/components/ChatFlow/CommonTable';
import { EyeIcon } from '@/components/Icon';
import style from '@/pages/select-product/components/ImproveComponents/analysisProductTable.module.css';
import { $t } from '@/i18n';


const columns = [
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveCommentTable.tag", "标签"),
    dataIndex: 'reviewTag',
    key: 'reviewTag',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveCommentTable.taglx", "标签类型"),
    dataIndex: 'sentimentTypeName',
    key: 'sentimentTypeName',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveCommentTable.commentQuantity", "评论数量"),
    dataIndex: 'reviewCnt',
    key: 'reviewCnt',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveCommentTable.cz", "操作"),
    dataIndex: 'action',
    key: 'action',
    width: 124,
    fixed: 'right',
    render: (text, record, index, { onActionClick }) => {
      return (
        <div className={style.action} onClick={() => onActionClick({ type: 'viewDetail', record })}>
          <EyeIcon />
          <span>{$t("global-1688-ai-app.select-product.ImproveComponents.ImproveCommentTable.reviewyw", "评价原文")}</span>
        </div>
      );
    },
  },
];

export const ImproveCommentTable = (props: any) => {
  const { reviewTagAggregateVOList, onActionClick } = props;

  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('COMMENT_DETAIL_MODAL', record);
        break;
      case '':
        break;
    }
  };

  return (
    <CommonTable
      data={reviewTagAggregateVOList || []}
      columns={columns}
      onActionComplete={handleActionClick}
    />
  );
};