import CommonTable from '@/components/ChatFlow/CommonTable';
import { EyeIcon } from '@/components/Icon';
import style from './index.module.css';
import { IMG_COLUMN, TITLE_COLUMN } from '../../RightComponents/columns';
import { $t } from '@/i18n';

const columns = [
  IMG_COLUMN,
  TITLE_COLUMN,
  {
    title: '类目',
    dataIndex: 'catePath',
    key: 'catePath',
    width: 240,
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewTable.sjtime", "上架时间"),
    dataIndex: 'onShelfDate',
    key: 'onShelfDate',
  },
  {
    title: "评论数",
    dataIndex: 'reviewCnt',
    key: 'reviewCnt',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewTable.cz", "操作"),
    dataIndex: 'action',
    key: 'action',
    width: 124,
    fixed: 'right',
    render: (text, record, index, { onActionClick }) => {
      return (
        <div className={style.action} onClick={() => onActionClick({ type: 'viewDetail', record })}>
          <EyeIcon />
          <span>{$t("global-1688-ai-app.select-product.ImproveComponents.ReviewTable.viewComment", "查看评论")}</span>
        </div>
      );
    },
  },
];

export const ReviewTable = (props: any) => {
  const { oppProductList = [], onActionClick } = props;

  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('REVIEW_DETAIL_MODAL', {
          productId: record?.productId,
        });
        break;
      case '':
        break;
    }
  };
  // console.log('oppProductList', oppProductList);
  return (
    <CommonTable
      data={oppProductList}
      columns={columns}
      onActionComplete={handleActionClick}
      sticky
    />
  );
};