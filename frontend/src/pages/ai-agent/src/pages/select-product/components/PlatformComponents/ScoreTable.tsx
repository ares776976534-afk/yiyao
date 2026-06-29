import CommonTable from '@/components/ChatFlow/CommonTable';
import { EyeIcon } from '@/components/Icon';
import style from '@/pages/select-product/components/ImproveComponents/analysisProductTable.module.css';
import { TITLE_COLUMN, IMG_COLUMN, TARGET_PRODUCT_COLUMN } from '../RightComponents/columns';
import { $t } from '@/i18n';

const columns = (comparedTitle: string) => [
  IMG_COLUMN,
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.ScoreTable.qyjhf", "迁移机会分"),
    dataIndex: 'oppScore',
    key: 'oppScore',
  },
  TITLE_COLUMN,
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.ScoreTable.lm", "类目"),
    dataIndex: 'catePath',
    key: 'catePath',
    width: 240,
  },
  TARGET_PRODUCT_COLUMN(comparedTitle),
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.ScoreTable.cz", "操作"),
    dataIndex: 'action',
    key: 'action',
    width: 124,
    fixed: 'right',
    render: (text, record, index, { onActionClick }) => {
      return (
        <div className={style.action} onClick={() => onActionClick({ type: 'viewDetail', record })}>
          <EyeIcon />
          <span>{$t("global-1688-ai-app.select-product.PlatformComponents.ScoreTable.viewDetails", "查看详情")}</span>
        </div>
      );
    },
  },
];

export const ScoreTable = (props: any) => {
  const { oppProductList = [], onActionClick, comparedTitle } = props;
  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('MIGRATED_COMPARED_DETAIL_MODAL', record);
        break;
      case '':
        break;
    }
  };

  return (
    <CommonTable
      data={oppProductList}
      columns={columns(comparedTitle)}
      onActionComplete={handleActionClick}
    />
  );
};