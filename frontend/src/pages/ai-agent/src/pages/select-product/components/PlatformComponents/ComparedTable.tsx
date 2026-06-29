import CommonTable from '@/components/ChatFlow/CommonTable';
import { EyeIcon } from '@/components/Icon';
import style from '@/pages/select-product/components/ImproveComponents/analysisProductTable.module.css';
import { TITLE_COLUMN, IMG_COLUMN } from '../RightComponents/columns';
import { $t } from '@/i18n';

const columns = [
  IMG_COLUMN,
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.ComparedTable.qyjhf", "迁移机会分"),
    dataIndex: 'oppScore',
    key: 'oppScore',
  },
  TITLE_COLUMN,
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.ComparedTable.lm", "类目"),
    dataIndex: 'catePath',
    key: 'catePath',
    width: 240,
  },
  {
    title: $t("global-1688-ai-app.select-product.PlatformComponents.ComparedTable.cz", "操作"),
    dataIndex: 'action',
    key: 'action',
    width: 124,
    fixed: 'right',
    render: (text, record, index, { onActionClick }) => {
      return (
        <div className={style.action} onClick={() => onActionClick({ type: 'viewDetail', record })}>
          <EyeIcon />
          <span>{$t("global-1688-ai-app.select-product.PlatformComponents.ComparedTable.viewDetails", "查看详情")}</span>
        </div>
      );
    },
  },
];

export const ComparedTable = (props: any) => {
  const { oppProductList = [], onActionClick } = props;
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
      columns={columns}
      onActionComplete={handleActionClick}
    />
  );
};