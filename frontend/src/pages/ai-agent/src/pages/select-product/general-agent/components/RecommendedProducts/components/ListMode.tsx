import styles from './listMode.module.scss';
import { Table, message, Tooltip } from 'antd';
import * as clipboard from 'clipboard-polyfill';
import { Copy3Icon, DownArrowIcon } from '@/components/Icon';
import VariantPopover from './VariantPopover';
import { listDataProps } from '../interface';
import LineAreaChart from '@/components/ChatFlow/LineAreaChart';
import Action from './Action';
import { $t } from "@/i18n";

interface ListModeProps {
  listData: listDataProps[];
}
const ListMode = ({ listData }: ListModeProps) => {
  // 判断listData是否platform为amazon
  const isAmazon = listData.some((item) => item.platform === 'amazon');
  const columns = [
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.productInformation", "商品信息"),
      dataIndex: 'productInfo',
      key: 'productInfo',
      width: 240,
      render: (text: string, record: any, index: number) => {
        const { imageUrl, title, productUrl, sellingPrice, currency, productId, aiRecommended } = record;
        const handleCopyAsin = (asin) => {
          clipboard.writeText(asin).then(() => {
            message.success($t("global-1688-ai-app.Share.copySuccess", "复制成功"));
          }).catch(() => {
            message.error($t("global-1688-ai-app.inquiry.InquiryReport.AutoOrderInfo.caqp", "复制失败，请手动复制"));
          });
        };
        const handleClick = () => {
          window.open(productUrl, '_blank');
        };
        return (
          <div className={styles.productInfo}>
            <div className={styles.productInfoItem}>
              <div className={styles.productInfoItemImage} onClick={handleClick}>
                <img src={imageUrl} alt="" />
                <div className={styles.productInfoItemNum}>{index + 1}</div>
              </div>
              <div className={styles.productInfoItemInfo}>
                <div className={styles.productInfoItemInfoTitle} onClick={handleClick}>{title}</div>
                <div className={styles.productInfoItemInfoPrice}>{currency}{sellingPrice}</div>
              </div>
            </div>
            <div className={styles.bigCardContentTitleTextWrapper}>
              {aiRecommended && <div className={styles.bigCardContentTitleTextAIRecommend}>{$t("global-1688-ai-app.ChatFlow.AIrecommend", "AI推荐")}</div>}
              <div className={styles.productInfoItemAsin}>
                ID: {productId}
                <div onClick={() => handleCopyAsin(productId)}>
                  <Copy3Icon />
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.ListMode.categoryRank", "一级类目/三级类目排名"),
      dataIndex: 'categoryRank',
      key: 'categoryRank',
      width: 200,
      render: (text: string, record: any) => {
        const { cateLev1Ranking, cateLev1Name, cateLev3Ranking, cateLev3Name } = record;
        return (
          <div className={styles.categoryRank}>
            {cateLev1Ranking && cateLev1Name && <div className={styles.categoryRankItem}>
              {cateLev1Ranking && <div className={styles.categoryRankItemNumber}>#{cateLev1Ranking}</div>}
              {cateLev1Name && (
                <Tooltip title={cateLev1Name}>
                  <div className={styles.itemTextDesc}>
                    <div className={styles.categoryRankItemNumberDesc}>in</div>
                    <span className={styles.categoryRankItemNumberDescText}>{cateLev1Name}</span>
                  </div>
                </Tooltip>
              )}
            </div>}
            {cateLev3Ranking && cateLev3Name && <div className={styles.categoryRankItem}>
              {cateLev3Ranking && <div className={styles.categoryRankItemNumber}>#{cateLev3Ranking}</div>}
              {cateLev3Name && (
                <Tooltip title={cateLev3Name}>
                  <div className={styles.itemTextDesc}>
                    <div className={styles.categoryRankItemNumberDesc}>in</div>
                    <span className={styles.categoryRankItemNumberDescText}>{cateLev3Name}</span>
                  </div>
                </Tooltip>
              )}
            </div>}
          </div>
        )
      }
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.jys", "近30天销量"),
      dataIndex: 'soldCnt30d',
      key: 'soldCnt30d',
      width: 234,
      render: (text: string, record: any) => {
        const { soldGrowthRate = {}, salesTrends = [], sold30d = '-' } = record;
        return (
          <div className={styles.sales30dContainer}>
            <div className={styles.sales30d}>
              <div className={styles.item}>
                <div className={styles.label}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.sales", "销量")}:</div>
                <div className={styles.value}>{sold30d}</div>
              </div>
              <div className={styles.item}>
                <div className={styles.label}>{$t("global-1688-ai-app.select-product.general-agent.ListMode.salesGrowthRate", "销量增长率")}:</div>
                <div className={styles.value}>{soldGrowthRate?.value || '-'}</div>
              </div>
            </div>
            {salesTrends.length > 0 && (
              <div className={styles.sales30dChart}>
                <div className={styles.chartCellIsolate}>
                  <LineAreaChart
                    data={salesTrends}
                    style={{ height: '66px', width: '80px' }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      }
    },
    isAmazon && {
      title: $t("global-1688-ai-app.select-product.general-agent.BigCard.variantCount", "变体数"),
      dataIndex: 'variantCount',
      key: 'variantCount',
      width: 100,
      render: (text: string, record: any) => {
        const { variantCnt, platform, region, productId } = record;
        return (
          variantCnt > 0 ? (
            <VariantPopover openClassName={styles.tagItemVariantOpen} platform={platform} region={region} productId={productId}>
              <div className={`${styles.tagItem} ${styles.tagItemVariant}`}>
                <div className={styles.tagItemValue}>
                  {variantCnt || '-'} <DownArrowIcon className={styles.arrowUp} width={12} height={12} />
                </div>
              </div>
            </VariantPopover>
          ) : (
            <div className={styles.tagItemValue}>-</div>
          )
        )
      }
    },
    {
      title: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenMarketAnalysis.MarketAnalysis.j30dayxse", "近30天销售额"),
      dataIndex: 'soldAmount30d',
      key: 'soldAmount30d',
      width: 200,
      render: (text: string, record: any) => text
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameInfo.rating", "评分"),
      dataIndex: 'rating',
      key: 'rating',
      width: 200,
      render: (text: string, record: any) => {
        const { ratingScore = '-', reviewCnt = '-' } = record;
        return (
          <div className={styles.sales30d}>
            <div className={styles.item}>
              <div className={styles.label}>{$t("global-1688-ai-app.select-product.general-agent.ListMode.ratingValue", "评分值")}:</div>
              <div className={styles.value}>{ratingScore}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.KeyWordReview.ratings", "评分数")}:</div>
              <div className={styles.value}>{reviewCnt}</div>
            </div>
          </div>
        )
      }
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.ComparedDetailTable.sjtime", "上架时间"),
      dataIndex: 'launchTime',
      key: 'launchTime',
      width: 200,
      render: (text: string) => <div className={styles.onShelfDate}>{text}</div>
    },
    {
      title: $t("global-1688-ai-app.inquiry.InquiryReport.SupplierComparison.cz", "操作"),
      dataIndex: 'operation',
      key: 'operation',
      width: 144,
      fixed: 'right',
      render: (text: string, record: any) => {
        const { imageUrl } = record;
        return <Action imageUrl={imageUrl} />
      }
    }
  ].filter(Boolean);
  return (
    <div className={styles.listMode}>
      <Table
        rowKey="productId"
        tableLayout="fixed"
        dataSource={listData}
        columns={columns}
        scroll={{ x: 1600 }}
        pagination={false}
        bordered
      />
    </div>
  );
}

export default ListMode;