import { DefaultBtn } from '@/components/ChatFlow/ColorfulBtn';
import CommonTable from '@/components/ChatFlow/CommonTable';
import { windowWidth } from '@/components/ChatFlow/utils.js';
import { TARGET_PRODUCT_COLUMN, TITLE_COLUMN } from '../RightComponents/columns';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';

export const MigratedTable = (props: any) => {
  const { oppProductList = [], onActionClick, comparedTitle } = props;
  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('MIGRATED_DETAIL_MODAL', record);
        break;
      case '':
        break;
    }
  };
  const columns = (comparedTitle: string) => [
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedTable.productImage", "商品图片"),
      dataIndex: 'mainImgUrl',
      key: 'mainImgUrl',
      render: (text, record) => {
        return (
          <FrostedGlass
            style={{ width: 60, height: 60 }}
            riskStatus={record?.riskStatus}
            productUrl={record?.productUrl || ''}
            imageUrl={text}
          />
        );
      },
    },
    TITLE_COLUMN,
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedTable.tks", "同款数"),
      dataIndex: 'spItemCnt',
      key: 'spItemCnt',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedTable.sjtime", "上架时间"),
      dataIndex: 'onShelfDate',
      key: 'onShelfDate',
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedTable.lm", "类目"),
      dataIndex: 'catePath',
      key: 'catePath',
      width: 240,
    },
    TARGET_PRODUCT_COLUMN(comparedTitle),
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.MigratedTable.cz", "操作"),
      dataIndex: 'action',
      key: 'action',
      width: 124,
      fixed: 'right',
      render: (text, record, index, { onActionClick }) => {
        return (
          <div className="flex justify-center">
            <DefaultBtn
              title={$t("global-1688-ai-app.select-product.PlatformComponents.MigratedTable.viewDetails", "查看详情")}
              icon={5}
              onClick={() => onActionClick({ type: 'viewDetail', record })}
            />
          </div>
        );
      },
    },
  ];
  return (
    <CommonTable
      data={oppProductList}
      columns={columns(comparedTitle)}
      containerWidth={windowWidth}
      onActionComplete={handleActionClick}
    />
  );
};