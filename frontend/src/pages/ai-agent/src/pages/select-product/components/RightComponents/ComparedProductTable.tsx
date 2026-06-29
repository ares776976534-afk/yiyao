import { DefaultBtn } from '@/components/ChatFlow/ColorfulBtn';
import CommonTable from '@/components/ChatFlow/CommonTable';
import { windowWidth } from '@/components/ChatFlow/utils.js';
import { IMG_COLUMN, IMG_COLUMN_WITH_LOG, TITLE_COLUMN } from './columns';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';

export const ComparedProductTable = (props: any) => {
  const { oppProductList = [], onActionClick, isProduct, imgClickLogKey } = props;
  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('COMPARED_DETAIL_MODAL', {
          detailData: record?.detailData,
          summary: record?.summary,
          status: record?.status,
          isProduct
        });
        break;
      case '':
        break;
    }
  };
  const columns = [
    imgClickLogKey ? IMG_COLUMN_WITH_LOG(imgClickLogKey) : IMG_COLUMN,
    TITLE_COLUMN,
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.ComparedProductTable.tks", "同款数"),
      dataIndex: 'spItemCnt',
      key: 'spItemCnt',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.ComparedProductTable.sjtime", "上架时间"),
      dataIndex: 'onShelfDate',
      key: 'onShelfDate',
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.ComparedProductTable.keyword", "关键词"),
      dataIndex: 'catePath',
      key: 'catePath',
      width: 240,
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.ComparedProductTable.tt5", "同类目热销Top5"),
      dataIndex: 'sameCateHotSaleList',
      key: 'sameCateHotSaleList',
      width: 288,
      fixed: 'right',
      render: (text, record) => {
        return (<div className="flex gap-1.5">
          {record?.sameCateHotSaleList.map((item, index) => {
            return (
              <FrostedGlass
                key={`${item.mainImgUrl}-${index}`}
                style={{ width: 60, height: 60 }}
                productUrl={item?.productUrl || ''}
                riskStatus={item?.riskStatus}
                imageUrl={item?.mainImgUrl}
                logKey={imgClickLogKey}
                logParams={{
                  productId: item?.productId || '',
                  title: item?.title || '',
                  isHotSaleItem: true,
                }}
               />
            );
          })}
        </div>);
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.ComparedProductTable.cz", "操作"),
      dataIndex: 'action',
      key: 'action',
      width: 124,
      fixed: 'right',
      render: (text, record, index, { onActionClick }) => {
        return (
          <div className="flex justify-center">
            <DefaultBtn
              title={$t("global-1688-ai-app.select-product.RightComponents.ComparedProductTable.viewDetails", "查看详情")}
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
      columns={columns}
      containerWidth={windowWidth}
      onActionComplete={handleActionClick}
    />
  );
};