import React, { useState } from 'react';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import styles from './offerCard.module.css';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { StarMarkerIcon, SearchIcon } from '@/components/Icon';
import { MainBtn, SecondaryBtn } from '@/components/ChatFlow/Btn';
import { $t } from '@/i18n';
import { appBaseUrl } from '@/utils/env';

interface ProductCardProps {
  data?: any;
}

export const CardHeader = ({ data }) => {
  const { navigateByCache } = useChatQuery();

  const handleFindSupplier = (e) => {
    e.stopPropagation();
    navigateByCache({ chatInput: { searchImageUrl: data.imageUrl, intention: 'AUTO' }, url: '/sourcing', isMakeSimilar: false, target: 'blank' });
  };

  // 素材处理跳转
  const handleMaterialProcessing = (e) => {
    e.stopPropagation();
    window.open(`${appBaseUrl}/studio?images=${data.imageUrl}&keyword=${data.title}`, '_blank');
  };

  const handleProductClick = (e) => {
    e.stopPropagation();
    if (!data?.productUrl) return;
    window.open(data.productUrl, '_blank');
  };

  return (
    <div className={styles.productHeader} onClick={handleProductClick}>
      <FrostedGlass
        style={{ width: 180, height: 180, borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
        riskStatus={data?.riskStatus}
        productUrl={data?.productUrl || ''}
        imageUrl={data.imageUrl}
        logKey={LOG_KEYS.GENERAL_AGENT.LP.ITEMLIST_IMGCLICK}
        logParams={{
          productId: data?.productId || data?.spId || '',
          title: data?.title || '',
        }}
      />
      <div className={styles.productInfo}>
        <div className={styles.productDetails}>
          <div className={styles.productTextContainer}>
            <span className={styles.productTitle}>
              {data.title}
            </span>
            <span className={styles.categoryText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.sslm", `所属类目：${data.categoryNamePath}`, [data.categoryNamePath])}</span>
            <span className={styles.metaText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.sj", `${data.spLaunchTime}上架｜${data.platform}`, [data.spLaunchTime, data.platform])}</span>
          </div>
          <div className={styles.actionButtons}>
            <MainBtn style={{ width: '140px', height: '36px' }} icon={<SearchIcon />} text={$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.ztkgys", "找同款供应商")} handleBtn={handleFindSupplier} />
            <SecondaryBtn style={{ width: '140px', height: '36px' }} icon={<StarMarkerIcon />} text={$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.sccl", "素材处理")} handleBtn={handleMaterialProcessing} />
          </div>
        </div>
      </div>
    </div>
  )
}

const ProductCard: React.FC<ProductCardProps> = ({ data = {} }) => {
  if (data?.reviewInfo) {
    data = {
      ...data,
      positiveReviews: data?.reviewInfo?.reviewLabel?.map(item => item.sentiment === 'POSITIVE' ? item : null)?.filter(Boolean)?.slice(0, 10),
      negativeReviews: data?.reviewInfo?.reviewLabel?.map(item => item.sentiment === 'NEGATIVE' ? item : null)?.filter(Boolean)?.slice(0, 10)
    }
  }

  const renderTrendIcon = (trend?: string) => {
    if (trend === 'up') {
      return (
        <img
          className={styles.trendIcon}
          src="https://img.alicdn.com/imgextra/i4/6000000007355/O1CN01wyiJgC24CeATVEz7b_!!6000000007355-2-gg_dtc.png"
        />
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.productContent}>
        <div className={styles.amazonSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIndicator}></div>
            <span className={styles.sectionTitle}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.tdna", `${data.platform}同款商品信息`, [data.platform])}</span>
          </div>
          <div className={styles.statsContainer}>
            {([
              { key: 'sameProductCount', label: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.tkproducts", "同款商品数"), value: data?.sameStyleItemCnt, showTrend: true },
              { key: 'sales30Days', label: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.jys", "近30天销量"), value: data?.sold30d },
              { key: 'averageRating', label: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.pjrating", "平均评分"), value: data?.reviewInfo?.ratingScore },
              { key: 'averagePrice', label: $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.pjprice", "平均价格"), value: data?.sameStylePrice }
            ]).map((statItem, index) => (
              <div key={statItem?.key || index} className={styles.statItem}>
                <div className={styles.statLabel}>
                  <span className={styles.statLabelText}>{statItem?.label}</span>
                  {/* <img
                    className={styles.infoIcon}
                    src="https://img.alicdn.com/imgextra/i3/6000000001952/O1CN01wbVMIX1QI4DyIUBNS_!!6000000001952-2-gg_dtc.png"
                  /> */}
                </div>
                <div className={styles.statValue}>
                  <div className={styles.statNumber}>
                    <span className={styles.numberText}>{statItem?.value}</span>
                  </div>
                  {statItem?.showTrend && renderTrendIcon(data?.amazonInfo?.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.reviewsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.positiveSectionIndicator}></div>
            <span className={styles.sectionTitle}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.piv", "好评点")}</span>
          </div>
          <div className={styles.tagsContainer}>
            {
              data?.positiveReviews?.length > 0 ? data?.positiveReviews?.map((review, index) => (
                <div key={index} className={styles.tag}>
                  <span className={styles.tagText}>{review.labelName}</span>
                  <span className={styles.tagPercentage}>{review.percent}%</span>
                </div>
              )) : <div className={styles.noReviewTag}>
                <span className={styles.noReviewText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.zirw", "暂无好评")}</span>
              </div>}
          </div>
        </div>
        <div className={styles.negativeReviewsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.negativeSectionIndicator}></div>
            <span className={styles.sectionTitle}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.niv", "差评点")}</span>
          </div>
          <div className={styles.tagsContainer}>
            {data?.negativeReviews?.length > 0 ? (
              data?.negativeReviews?.map((review, index) => (
                <div key={index} className={styles.tag}>
                  <span className={styles.tagText}>{review.labelName}</span>
                  <span className={styles.tagPercentage}>{review.percent}%</span>
                </div>
              ))
            ) : (
              <div className={styles.noReviewTag}>
                <span className={styles.noReviewText}>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.zarw", "暂无差评")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
