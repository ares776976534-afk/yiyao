import CommonTable from '@/components/ChatFlow/CommonTable';
import { EyeIcon } from '@/components/Icon';
import style from './analysisProductTable.module.css';
import { IMG_COLUMN, TITLE_COLUMN } from '../RightComponents/columns';
import { $t } from '@/i18n';

const columns = [
  IMG_COLUMN,
  TITLE_COLUMN,
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductTable.lm", "类目"),
    dataIndex: 'catePath',
    key: 'catePath',
    width: 240,
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductTable.ggo", "改进建议总结"),
    dataIndex: 'plaintext',
    key: 'plaintext',
    width: 300,
    render: (text) => {
      return <div className="line-clamp-3 text-gray-800 leading-snug">{text}</div>;
    },
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductTable.cz", "操作"),
    dataIndex: 'action',
    key: 'action',
    width: 124,
    fixed: 'right',
    render: (text, record, index, { onActionClick }) => {
      return (
        <div className={style.action} onClick={() => onActionClick({ type: 'viewDetail', record })}>
          <EyeIcon />
          <span>{$t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductTable.viewDetails", "查看详情")}</span>
        </div>
      );
    },
  },
];

export const AnalysisProductTable = (props: any) => {
  const { oppProductList = [], onActionClick } = props;
  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('ANALYSIS_DETAIL_MODAL', record);
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