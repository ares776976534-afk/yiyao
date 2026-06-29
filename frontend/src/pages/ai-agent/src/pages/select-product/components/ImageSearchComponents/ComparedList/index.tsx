import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { ImgCard, DifferenceCard } from '@/components/ChatFlow/SpecialCard';
import type { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';

interface ComparedListProps {
  title?: string;
  oppProductList?: any[];
  description?: string;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  rightSideType?: string;
  isShowSite?: boolean;
  cardId?: string;
  cardType?: string;
}

export const ComparedList: React.FC<ComparedListProps> = (data) => {
  const { cardId, cardType,
    title, oppProductList = [], description, cardSubType, onMoreClick, rightSideType, isShowSite = false } = data;

    // console.warn('oppProductList', oppProductList);
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
      otherContent={(item) => (<div>
        <DifferenceCard
          showDetail={false}
          status={item?.status}
          successText={item?.analysisResult || $t("global-1688-ai-app.select-product.PlatformComponents.ComparedList.dbcomplete", "对比完成")}
          compareText={item?.analysisResult || $t("global-1688-ai-app.select-product.PlatformComponents.ComparedList.zuo", "正在对比功能差异")}
        />
      </div>)}
      onMoreClick={() => {
        onMoreClick(cardSubType, data);
      }}
    />
  );
};