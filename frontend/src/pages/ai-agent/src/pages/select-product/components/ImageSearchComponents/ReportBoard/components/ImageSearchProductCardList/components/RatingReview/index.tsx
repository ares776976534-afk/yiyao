import React, { useMemo } from 'react';
import type { TypeRatingReviewProps } from './types';
import ReviewSection from './components/ReviewSection';
import styles from './index.module.css';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { $t } from '@/i18n';

function RatingReview(props: TypeRatingReviewProps) {
  const { componentData, title, onActionClick } = props;
  // console.warn('RatingReviewComponentData', componentData);

  const { posCategoryTagList = [],
    posPointTagTitle = '',
    negCategoryTagList = [],
    negPointTagTitle = '',
    productId = '',
  } = componentData || {};

  // const postCategoryCount = useMemo(() => {
  //   return posCategoryTagList?.reduce((acc, curr) => {
  //     return acc + (curr.count || 0);
  //   }, 0);
  // }, [posCategoryTagList]);

  // const negCategoryCount = useMemo(() => {
  //   return negCategoryTagList?.reduce((acc, curr) => {
  //     return acc + (curr.count || 0);
  //   }, 0);
  // }, [negCategoryTagList]);

  if (!componentData) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerTitle}>
        {/* <div className={styles.dot} /> */}
        <div className={styles.headerTitleText}>{$t('global-1688-ai-app.ChatFlow.ItemComment.productComment', '商品评论')}</div>
        <div
          onClick={() => {
            if (productId) {
              onActionClick?.('REVIEW_DETAIL_MODAL', {
                productId: productId,
              });
            }
          }}
          className={styles.headerDetailIcon}
        >
          <img className={styles.headerDetailIconImg} src={imgIcon[5]} alt="img" />
        </div>
      </div>
      {/* 好评部分 */}
      {posCategoryTagList && posCategoryTagList.length > 0 ? (
        <ReviewSection
          title={$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.piv', '好评点')}
          dotClassName={styles.greenDot}
          categoryTagList={posCategoryTagList}
          statisticsText={
            <>
              <span className={styles.normalText}>{$t('global-1688-ai-app.ChatFlow.ItemComment.yj', '已有')}</span>
              <span className={styles.highlightText}> {posPointTagTitle} </span>
              <span className={styles.normalText}>{$t('global-1688-ai-app.ChatFlow.ItemComment.pljtsp', '评论推荐该商品：')}</span>
            </>
          }
        />
      ) : (
        <div className={styles.positiveSection}>
          <div className={styles.titleSection}>
            <div className={styles.greenDot} />
            <span className={styles.titleText}>{$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.piv', '好评点')}</span>
          </div>
          <div className={styles.negativeContent}>
            <div className={styles.messageWrapper}>
              <span className={styles.message}>{componentData?.posPointDesc}</span>
            </div>
          </div>
        </div>
      )}

      {/* 差评部分 */}
      {negCategoryTagList && negCategoryTagList.length > 0 ? (
        <div className={styles.negativeSection}>
          <ReviewSection
            title={$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.niv', '差评点')}
            dotClassName={styles.redDot}
            categoryTagList={negCategoryTagList}
            statisticsText={
              <>
                <span className={styles.normalText}>{$t('global-1688-ai-app.ChatFlow.ItemComment.yj', '已有')}</span>
                <span className={styles.highlightText}> {negPointTagTitle} </span>
                <span className={styles.normalText}>{$t('global-1688-ai-app.ChatFlow.ItemComment.cppl', '差评评论：')}</span>
              </>
            }
          />
        </div>
      ) : (
        <div className={styles.negativeSection}>
          <div className={styles.titleSection}>
            <div className={styles.redDot} />
            <span className={styles.titleText}>{$t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.niv', '差评点')}</span>
          </div>
          <div className={styles.negativeContent}>
            <div className={styles.messageWrapper}>
              <span className={styles.message}>{componentData?.negPointDesc}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RatingReview;

