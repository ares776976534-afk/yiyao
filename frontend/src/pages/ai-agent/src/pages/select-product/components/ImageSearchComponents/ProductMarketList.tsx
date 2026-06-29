import React from 'react';
import styles from './productMarketList.module.css';
import { RightOutlinedIcon, PlatformIcon } from '@/components/Icon';
import { $t } from "@/i18n";

interface TypeProductMarketCard {
  title: string;
  subTitle: string;
}

interface TypeProductMarketListProps {
  title?: string;
  cardSubList?: TypeProductMarketCard[];
  onMoreClick: (cardSubType: any, data: any) => void;
  cardId?: string;
  cardType?: string;
  cardSubType?: string;
}

export const ProductMarketList: React.FC<TypeProductMarketListProps> = (props) => {
  const {
    title = $t('global-1688-ai-app.select-product.ImageSearchComponents.ProductMarketList.productMarket', '商品市场'),
    cardSubList = [],
    onMoreClick,
    cardType,
    cardId,
    cardSubType,
  } = props;

  return (
    <div
      className={styles.container}
      data-card-id={cardId}
      data-card-type={cardType}
      data-card-sub-type={cardSubType}
    >
      <div className={styles.header}>
        <PlatformIcon width={16} height={16} />
        <span className={styles.headerText}>{title}</span>
      </div>
      <div className={styles.productCards}>
        {(cardSubList || []).map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.titleContainer}>
                <span className={styles.cardTitle}>{card.title}</span>
              </div>
              <div className={styles.subtitleContainer}>
                <span className={styles.cardSubtitle}>{card.subTitle}</span>
              </div>
            </div>
          </div>
        ))}
        {onMoreClick && (
          <div
            className={styles.detailCard}
            onClick={() => {
              onMoreClick(cardType, props);
            }}
          >
            <div className={styles.detailContent}>
              <span className={styles.detailText}>{$t('global-1688-ai-app.ChatFlow.AdditionalDetailsCard.viewDetails', '查看详情')}</span>
              <RightOutlinedIcon width={12} height={12} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

