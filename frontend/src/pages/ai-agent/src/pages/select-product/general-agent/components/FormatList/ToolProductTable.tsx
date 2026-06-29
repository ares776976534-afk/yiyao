import CommonTable from '@/components/ChatFlow/CommonTable';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import SimilarCount from '@/components/ChatFlow/SimilarCount';
import { $t } from '@/i18n';
import { Tooltip } from 'antd';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

export const ToolProductTable = (props: any) => {
  const { oppProductList = [] } = props;

  // 带埋点的图片列
  const IMG_COLUMN_WITH_LOG = {
    title: $t("global-1688-ai-app.select-product.RightComponents.columns.productImage", "商品图片"),
    dataIndex: 'mainImgUrl',
    key: 'mainImgUrl',
    render: (text: string, record: any) => {
      if (text) {
        return (
          <FrostedGlass
            style={{ width: 60, height: 60 }}
            riskStatus={record?.riskStatus}
            productUrl={record?.productUrl || ''}
            imageUrl={text}
            logKey={LOG_KEYS.GENERAL_AGENT.LP.ITEMLIST_IMGCLICK}
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

  // 带埋点的标题列
  const TITLE_COLUMN_WITH_LOG = {
    title: $t("global-1688-ai-app.select-product.RightComponents.columns.productTitle", "商品标题"),
    dataIndex: 'title',
    key: 'title',
    width: 200,
    render: (text: string, record: any) => {
      const handleClick = () => {
        // 埋点：点击商品列表中的商品标题
        log.record(LOG_KEYS.GENERAL_AGENT.LP.TABLE_PRODUCT_CLICK, 'CLK', {
          productId: record?.productId || '',
          title: text || '',
        });
        record?.productUrl && window.open(record?.productUrl, '_blank');
      };
      return (
        text?.length < 40 ? (
          <div
            className="cursor-pointer hover:text-blue-500 line-clamp-2 text-sm text-gray-800 w-44 leading-snug"
            onClick={record?.productUrl ? handleClick : undefined}
          >{text}</div>
        ) : (
          <Tooltip title={text}>
            <div
              className="cursor-pointer hover:text-blue-500 line-clamp-2 text-sm text-gray-800 w-44 leading-snug"
              onClick={record?.productUrl ? handleClick : undefined}
            >
              {text}
            </div>
          </Tooltip>
        )
      );
    },
  };

  const columns = [
    IMG_COLUMN_WITH_LOG,
    TITLE_COLUMN_WITH_LOG,
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.gj", "国家"),
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.pt", "平台"),
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.lm", "类目"),
      dataIndex: 'catePath',
      key: 'catePath',
      width: 240,
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.sjtime", "上架时间"),
      dataIndex: 'onShelfDate',
      key: 'onShelfDate',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.sjy", "销量（近30天）"),
      dataIndex: 'soldCnt30d',
      key: 'soldCnt30d',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.ratingfs", "评分分数"),
      dataIndex: 'ratingRange',
      key: 'ratingRange',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.ratingts", "评分条数"),
      dataIndex: 'ratingCnt',
      key: 'ratingCnt',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.smprice", "售卖价格"),
      dataIndex: 'priceRange',
      key: 'priceRange',
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.ToolProductTable.tkquantity", "同款数量"),
      dataIndex: 'spItemCnt',
      key: 'spItemCnt',
      render: (count: number, record) => {
        return <SimilarCount count={count} record={record} />;
      },
    },
    // {
    //   title: '五点描述',
    //   dataIndex: 'description',
    //   key: 'description',
    //   render: (text) => {
    //     return (<div>
    //       {text}
    //     </div>);
    //   },
    // },
  ];
  return (
    <CommonTable data={oppProductList} columns={columns} />
  );
};