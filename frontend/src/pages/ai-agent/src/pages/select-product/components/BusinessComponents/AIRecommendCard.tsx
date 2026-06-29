import React from 'react';
import styles from './aIRecommendCard.module.css';
import { PositioningIcon, SendIcon } from '@/components/Icon';
import { Markdown } from '@/components/ChatFlow/Markdown';
import jumpTo from '@/utils/jumpTo';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';

interface dataProps {
  offerId: number;
  memberId: string;
  offerBaseInfo: {
    offerUrl: string;
    price: string;
    title: string;
    offerTags: string[];
    imageUrl: string;
  };
  providerBaseInfo: {
    companyName: string;
    primaryCate: string;
    homePageUrl: string;
  };
  recommendReason: string;
}

interface ProductRecommendationCardProps {
  data: dataProps;
  handleInquiry?: () => void;
  handleCompare?: (offerId: number) => void;
  AITopIndex?: number;
}

const ProductRecommendationCard: React.FC<ProductRecommendationCardProps> = (props) => {
  const { data, handleCompare, handleInquiry, AITopIndex = 0 } = props || {};
  const { offerId, offerBaseInfo, providerBaseInfo, recommendReason } = data || {};


  const handleInquiryClick = (_offerId: number) => {
    if (handleInquiry) {
      handleInquiry();
    } else {
      jumpTo(`/inquiry/new?fromPage=ZS&offerIds=${_offerId}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.productSection}>
        <img
          src={offerBaseInfo?.imageUrl}
          alt={$t("global-1688-ai-app.select-product.BusinessComponents.AIRecommendCard.productImage", "商品图片")}
          className={styles.productImage}
          onClick={() => window.open(offerBaseInfo?.offerUrl, '_blank')}
        />
        <div className={styles.productInfo}>
          {
            offerBaseInfo?.title?.length < 16 ? (
              <div className={styles.productName}>{offerBaseInfo?.title}</div>
            ) : (
              <Tooltip placement="top" title={offerBaseInfo?.title} arrow={true}>
                <div className={styles.productName}>{offerBaseInfo?.title}</div>
              </Tooltip>
            )
          }
          <span className={styles.productPrice}>
            {typeof offerBaseInfo?.price === 'string'
              ? offerBaseInfo.price
              : typeof offerBaseInfo?.price === 'object' && offerBaseInfo?.price && 'amountWithSymbol' in offerBaseInfo.price
                ? (offerBaseInfo.price as any).amountWithSymbol
                : offerBaseInfo?.price && typeof offerBaseInfo.price === 'object' && 'amount' in offerBaseInfo.price
                  ? `${(offerBaseInfo.price as any).currencySymbol || '$'}${(offerBaseInfo.price as any).amount}`
                  : $t("global-1688-ai-app.select-product.BusinessComponents.AIRecommendCard.pricedx", "价格待询")}
          </span>
        </div>
      </div>

      <div className={styles.supplierSection}>
        <div className={styles.supplierHeader}>
          <div className={styles.supplierInfo}>
            <div className={styles.supplierTitle}>
              {offerBaseInfo?.offerTags?.map((ele, index) => (
                <div className={styles.aiRecommendTag} key={ele}>
                  <span className={styles.aiText}>{ele}</span>
                  <span className={styles.rankText}>#{AITopIndex + 1}</span>
                </div>
              ))}
              <span className={styles.supplierName} onClick={() => window.open(providerBaseInfo?.homePageUrl, '_blank')}>
                {providerBaseInfo?.companyName}
              </span>
            </div>
            <span className={styles.supplierCategory}>{$t("global-1688-ai-app.select-product.BusinessComponents.AIRecommendCard.zylm", `主营类目：${providerBaseInfo?.primaryCate}`, [providerBaseInfo?.primaryCate])}</span>
          </div>

          <div className={styles.actionButtons}>
            <div
              className={styles.compareButton}
              onClick={() => {
                if (handleCompare && offerId) {
                  handleCompare(offerId);
                }
              }}
            >
              <PositioningIcon />
              <span>{$t("global-1688-ai-app.select-product.BusinessComponents.AIRecommendCard.viewgysdb", "查看供应商对比")}</span>
            </div>
            <div className={styles.inquiryButton} onClick={() => handleInquiryClick(offerId)}>
              <SendIcon />
              <span className={styles.inquiryText}>{$t("global-1688-ai-app.select-product.BusinessComponents.AIRecommendCard.fqxp", "发起询盘")}</span>
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.recommendationSection}>
          <span className={styles.recommendationTitle}>{$t("global-1688-ai-app.select-product.BusinessComponents.AIRecommendCard.rmy", "推荐理由：")}</span>
          <Markdown
            text={recommendReason}
            chunkIntervalMs={50}
            streamGranularity="char"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendationCard;
