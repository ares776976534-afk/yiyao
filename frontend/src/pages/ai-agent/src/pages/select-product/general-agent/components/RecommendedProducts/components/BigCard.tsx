import * as clipboard from 'clipboard-polyfill';
import { message, Tooltip } from 'antd';
import styles from './bigCard.module.scss';
import { Copy3Icon, DownArrowIcon, CollectionIcon, SavedCollectionIcon } from '@/components/Icon';
import VariantPopover from './VariantPopover';
import { listDataProps } from '../interface';
import Action from './Action';
import { $t } from "@/i18n";

const RATING_STAR_TOTAL = 5;

interface BigCardProps {
  itemData: listDataProps;
  index: number;
}
const BigCard = ({ itemData, index }: BigCardProps) => {
  const {
    productId,
    imageUrl,
    title,
    productUrl,
    sellingPrice,
    currency,
    cateLev1Ranking,
    cateLev1Name,
    cateLev3Ranking,
    cateLev3Name,
    sold30d,
    soldGrowthRate,
    ratingScore,
    reviewCnt,
    sameStyleItemCnt,
    launchTime,
    variantCnt,
    platform,
    region,
    aiRecommended,
  } = itemData;

  const handleCopyAsin = (asin: string) => {
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
    <div className={styles.bigCard}>
      <div className={styles.bigCardImageWrapper}>
        <div className={styles.bigCardImage}>
          <img src={imageUrl} alt="" />
          <div className={styles.imageActions} onClick={handleClick}>
            <Action imageUrl={imageUrl} type="bigCard" />
          </div>
          <div className={styles.imageHeader}>
            <div className={styles.bigPictureCardNum}>{index + 1}</div>
          </div>
        </div>
      </div>
      <div className={styles.bigCardContent}>
        <div className={styles.bigCardContentTitle}>
          <div className={styles.bigCardContentTitleTextWrapper}>
            {aiRecommended && <div className={styles.bigCardContentTitleTextAIRecommend}>{$t("global-1688-ai-app.ChatFlow.AIrecommend", "AI推荐")}</div>}
            <div className={styles.bigCardContentTitleText} onClick={handleClick}>{title}</div>
          </div>
          <div className={styles.bigCardContentTitlePrice}>
            <div className={styles.bigCardContentTitlePriceSymbol}>{currency}</div>
            <div className={styles.bigCardContentTitlePriceNumber}>{String(sellingPrice).split('.')[0]}</div>
            {String(sellingPrice).split('.')[1] && <div className={styles.bigCardContentTitlePriceDot}>.{String(sellingPrice).split('.')[1]}</div>}
          </div>
        </div>
        <div className={styles.dashedLine} />
        <div className={styles.bigCardContentASIN}>
          <div className={styles.bigCardContentASINText}>
            ID: {productId}
            <div onClick={() => handleCopyAsin(productId)}>
              <Copy3Icon />
            </div>
          </div>
          {cateLev1Ranking && cateLev1Name && <div className={styles.item}>
            {cateLev1Ranking && <div className={styles.itemText}>#{cateLev1Ranking}</div>}
            {cateLev1Name && (
              <Tooltip title={cateLev1Name}>
                <div className={styles.itemTextDesc}>
                  <div className={styles.itemTextDescText}>in</div>
                  <span className={styles.itemTextDescName}>{cateLev1Name}</span>
                </div>
              </Tooltip>
            )}
          </div>
          }
          {cateLev3Ranking && cateLev3Name && <div className={styles.item}>
            {cateLev3Ranking && <div className={styles.itemText}>#{cateLev3Ranking}</div>}  
            {cateLev3Name && (
              <Tooltip title={cateLev3Name}>
                <div className={styles.itemTextDesc}>
                  <div className={styles.itemTextDescText}>in</div>
                  <span className={styles.itemTextDescName}>{cateLev3Name}</span>
                </div>
              </Tooltip>
            )}
          </div>
          }
        </div>
        <div className={styles.bigCardContentTags}>
          {sold30d > 0 && <div className={styles.tagItem}>
            <div>{$t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.monthSales", "月销量")}</div>
            <div className={styles.tagItemValue}>
              {sold30d}
              {soldGrowthRate?.value > 0 && <span className={soldGrowthRate?.direction === 'up' ? styles.tagItemValueDescUp : styles.tagItemValueDescDown}>({soldGrowthRate?.direction === 'up' ? '+' : '-'}{soldGrowthRate?.value}%)</span>}
            </div>
          </div>}
          {ratingScore > 0 && <div className={styles.tagItem}>
            <div className={styles.tagItemText}>{$t("global-1688-ai-app.ChatFlow.SameInfo.rating", "评分")}</div>
            <div className={styles.tagItemValueWrapper}>
              <div className={styles.tagItemValue}>{ratingScore}</div>
              <div className={styles.tagItemValueIcon}>
                {Array.from({ length: RATING_STAR_TOTAL }, (_, i) =>
                  i < Math.floor(ratingScore) ? (
                    <SavedCollectionIcon key={i} />
                  ) : (
                    <CollectionIcon key={i} />
                  ),
                )}
              </div>
              {reviewCnt > 0 && <div className={styles.tagItemValueDesc}>({reviewCnt})</div>}
            </div>
          </div>}
          {variantCnt > 0 && <VariantPopover openClassName={styles.tagItemVariantOpen} platform={platform} region={region} productId={productId}>
            <div className={`${styles.tagItem} ${styles.tagItemVariant}`}>
              <div>{$t("global-1688-ai-app.select-product.general-agent.BigCard.variantCount", "变体数")}</div>
              <div className={styles.tagItemValue}>
                {variantCnt || 0} {variantCnt > 0 && <DownArrowIcon className={styles.arrowUp} width={12} height={12} />}
              </div>
            </div>
          </VariantPopover>}
          {sameStyleItemCnt > 0 && <div className={styles.tagItem}>
            <div>{$t("global-1688-ai-app.select-product.general-agent.BigCard.sameStyleItemCnt", "下游同款数")}</div>
            <div className={styles.tagItemValue}>{sameStyleItemCnt}</div>
          </div>}
        </div>
        <div className={styles.dashedLine} />
        <div className={styles.bigCardContentTime}>
          {$t("global-1688-ai-app.ChatFlow.ComparedDetailTable.sjtime", "上架时间")}: {launchTime}
        </div>
      </div>
    </div>
  );
};

export default BigCard;