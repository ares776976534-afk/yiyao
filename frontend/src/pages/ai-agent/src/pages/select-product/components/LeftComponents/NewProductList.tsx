import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface NewProductListProps {
  title?: string;
  oppProductList?: any[];
  description?: string;
  totalCount?: number;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  isProduct?: boolean;
  rightSideType?: string;
  isShowSite?: boolean;
  logKey?: string;
  imgClickLogKey?: string;
}

export const NewProductList: React.FC<NewProductListProps> = (data) => {
  const { title, isShowSite, cardId, cardType,
    totalCount, oppProductList = [], description, cardSubType,
    onMoreClick, isProduct, rightSideType, logKey, imgClickLogKey } = data;
  return (
    <ProductListGeneration
      cardId={cardId}
      cardType={cardType}
      cardSubType={cardSubType}
      data={oppProductList.slice(0, 5)}
      title={title}
      isShowSite={isShowSite}
      content={description}
      rightSideType={rightSideType}
      moreText={
        $t("global-1688-ai-app.select-product.LeftComponents.NormalProductList.guea",
          `共${totalCount}${isProduct ? `${$t('global-1688-ai-app.select-product.LeftComponents.NewProductList.ge', '个')}` : $t('global-1688-ai-app.select-product.LeftComponents.NewProductList.k', '款')}新品，查看详情`,
          [totalCount, isProduct ? $t('global-1688-ai-app.select-product.LeftComponents.NewProductList.ge', '个') : $t('global-1688-ai-app.select-product.LeftComponents.NewProductList.k', '款')]
        )
      }
      onMoreClick={() => {
        // 埋点：查看新品列表详情
        if (logKey) {
          log.record(logKey as `/${string}.${string}.${string}`, 'CLK', {
            cardSubType,
            title: title || '',
            totalCount: totalCount || 0,
          });
        }
        onMoreClick(cardSubType, data);
      }}
    />
  );
};