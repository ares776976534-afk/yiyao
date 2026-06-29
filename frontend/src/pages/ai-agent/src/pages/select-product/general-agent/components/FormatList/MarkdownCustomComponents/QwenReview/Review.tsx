import React, { useState } from 'react';
import styles from './review.module.css';
import { $t } from '@/i18n';

interface ReviewItem {
  labelName: string;
  percentOfAllReviews: number;
  count: number;
  keywordPositiveReviewTagVOList: ReviewItem[];
  keywordNegativeReviewTagVOList: ReviewItem[];
  scoreAvg: number;
  ratingCntAvg: number;
}

interface KeywordInfo {
  platform: string;
  country: string;
  scoreAvg: number;
  ratingCntAvg: number;
}

interface ProductAnalysisData {
  keyword: string;
  keywordInfo: KeywordInfo;
  keywordPositiveReviewTagVOList: ReviewItem[];
  keywordNegativeReviewTagVOList: ReviewItem[];
}

interface ProductAnalysisProps {
  id?: string;
  data?: ProductAnalysisData;
}

const ProductAnalysis: React.FC<ProductAnalysisProps> = ({ data }) => {
  const currentData = data || {};

  console.log(data)

  const renderReviewItem = (item: ReviewItem, index: number) => (
    <div key={index} className={styles.reviewRow}>
      <div className={styles.reviewText}>
        <span>{item.labelName}</span>
      </div>
      <div className={styles.reviewStats}>
        <span>{item.percentOfAllReviews}%（{item.count}）</span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFillGreen}
            style={{ width: `${Math.min(item.percentOfAllReviews * 2, 100)}%` }}
          ></div>
        </div>
      </div>
      {/* <div className={styles.reviewProducts}>
        <span>代表商品</span>
        <img
          className={styles.productImage}
          src={item.productImage}
          alt="代表商品"
        />
      </div> */}
    </div>
  );

  return (
    <div className={styles.content}>
      <div className={styles.keywordSection}>
        <div className={styles.sectionTitle}>
          <div className={styles.titleDot}></div>
          <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.keywordInformation", "关键词信息")}</span>
        </div>
        <div className={styles.keywordStats}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.pt", "平台")}</span>
            </div>
            <div className={styles.statValue}>
              <span>{currentData?.platform}</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.gjregion", "国家/地区")}</span>
            </div>
            <div className={styles.statValue}>
              <span className={styles.mediumFont}>{currentData?.region}</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.pjrating", "平均评分")}</span>
            </div>
            <div className={styles.statValue}>
              <span className={styles.mediumFont}>{currentData.scoreAvg}</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.commentts", "评论条数")}</span>
            </div>
            <div className={styles.statValue}>
              <span className={styles.mediumFont}>{currentData?.ratingCntAvg}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.reviewSectionContainer}>
        <div className={styles.reviewSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.titleDotGreen} />
            <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.pivT", "好评点（Top3）")}</span>
          </div>
          <div className={styles.reviewTable}>
            {currentData?.keywordPositiveReviewTagVOList?.slice(0, 3).map((item, index) => renderReviewItem(item, index))}
          </div>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.titleDotRed} />
            <span>{$t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenReview.Review.nivT", "差评点（Top3）")}</span>
          </div>
          <div className={styles.reviewTable}>
            {currentData?.keywordNegativeReviewTagVOList?.slice(0, 3).map((item, index) => renderReviewItem(item, index))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysis;
