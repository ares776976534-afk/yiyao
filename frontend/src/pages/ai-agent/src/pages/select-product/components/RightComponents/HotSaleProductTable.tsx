import { DefaultBtn } from '@/components/ChatFlow/ColorfulBtn';
import CommonTable from '@/components/ChatFlow/CommonTable';
import { windowWidth } from '@/components/ChatFlow/utils.js';
import { TITLE_COLUMN } from './columns';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';

export const HotSaleProductTable = (props: any) => {
  const { oppProductList = [], onActionClick, isProduct, imgClickLogKey } = props;
  const handleActionClick = ({ type, record }) => {
    switch (type) {
      case 'viewDetail':
        onActionClick('HOT_DETAIL_MODAL', {
          detailData: record?.detailData,
          isProduct
        });
        break;
      case '':
        break;
    }
  };
  const columns = [
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.productImage", "商品图片"),
      dataIndex: 'mainImgUrl',
      key: 'mainImgUrl',
      render: (text, record) => {
        return (
          <FrostedGlass
            style={{ width: 60, height: 60 }}
            riskStatus={record?.riskStatus}
            productUrl={record?.productUrl || ''}
            imageUrl={text}
            logKey={imgClickLogKey}
            logParams={{
              productId: record?.productId || '',
              title: record?.title || '',
            }}
          />
        );
      },
    },
    TITLE_COLUMN,
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.tks", "同款数"),
      dataIndex: 'spItemCnt',
      key: 'spItemCnt',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.sjtime", "上架时间"),
      dataIndex: 'onShelfDate',
      key: 'onShelfDate',
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.lm", "类目"),
      dataIndex: 'catePath',
      key: 'catePath',
      width: 240,
    },
    {
      title: $t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.tt5", "同类目热销Top5"),
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
                riskStatus={item?.riskStatus}
                productUrl={item?.productUrl || ''}
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
      title: $t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.cz", "操作"),
      dataIndex: 'action',
      key: 'action',
      width: 124,
      fixed: 'right',
      render: (text, record, index, { onActionClick }) => {
        return (
          <div className="flex justify-center">
            <DefaultBtn
              title={$t("global-1688-ai-app.select-product.RightComponents.HotSaleProductTable.viewDetails", "查看详情")}
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
