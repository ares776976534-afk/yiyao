import { Tooltip } from 'antd';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';

export const TITLE_COLUMN = {
  title: $t("global-1688-ai-app.select-product.RightComponents.columns.productTitle", "商品标题"),
  dataIndex: 'title',
  key: 'title',
  width: 200,
  render: (text, record) => {
    return (
      text?.length < 40 ? (
        <div
          className="cursor-pointer hover:text-blue-500 line-clamp-2 text-sm text-gray-800 w-44 leading-snug"
          onClick={record?.productUrl ? () => window.open(record?.productUrl, '_blank') : undefined}
        >{text}</div>
      ) : (
        <Tooltip title={text}>
          <div
            className="cursor-pointer hover:text-blue-500 line-clamp-2 text-sm text-gray-800 w-44 leading-snug"
            onClick={record?.productUrl ? () => window.open(record?.productUrl, '_blank') : undefined }
          >
            {text}
          </div>
        </Tooltip>
      )
    );
  },
};

export const IMG_COLUMN = {
  title: $t("global-1688-ai-app.select-product.RightComponents.columns.productImage", "商品图片"),
  dataIndex: 'mainImgUrl',
  key: 'mainImgUrl',
  render: (text, record) => {
    if (text) {
      return (
        <FrostedGlass
          style={{ width: 60, height: 60 }}
          riskStatus={record?.riskStatus}
          productUrl={record?.productUrl || ''}
          imageUrl={text}
        />
      );
    }
    return '-';
  },
};

export const IMG_COLUMN_WITH_LOG = (logKey?: string) => {
  return {
    title: $t("global-1688-ai-app.select-product.RightComponents.columns.productImage", "商品图片"),
    dataIndex: 'mainImgUrl',
    key: 'mainImgUrl',
    render: (text, record) => {
      if (text) {
        return (
          <FrostedGlass
            style={{ width: 60, height: 60 }}
            riskStatus={record?.riskStatus}
            productUrl={record?.productUrl || ''}
            imageUrl={text}
            logKey={logKey}
            logParams={{
              productId: record?.productId || '',
              title: record?.title || '',
            }}
          />
        );
      }
      return '-';
    },
  };
};

export const TARGET_PRODUCT_COLUMN = (comparedTitle: string) => {
  return {
    title: comparedTitle,
    dataIndex: 'targetProduct',
    key: 'targetProduct',
    fixed: 'right',
    render: (text, record) => {
      if (record?.targetProduct?.mainImgUrl) {
        return (
          <FrostedGlass
            style={{ width: 60, height: 60 }}
            riskStatus={record?.targetProduct?.riskStatus}
            productUrl={record?.targetProduct?.productUrl || ''}
            imageUrl={record?.targetProduct?.mainImgUrl}
          />
        );
      } else {
        return '-';
      }
    },
  };
};
