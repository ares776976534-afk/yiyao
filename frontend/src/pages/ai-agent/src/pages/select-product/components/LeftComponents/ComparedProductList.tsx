import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { ImgCard, DifferenceCard } from '@/components/ChatFlow/SpecialCard';
import type { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface ComparedProductListProps {
  title?: string;
  oppProductList?: any[];
  description?: string;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  isProduct?: boolean;
  rightSideType?: string;
  isShowSite?: boolean;
  cardId?: string;
  cardType?: string;
  logKey?: string;
  logKeyComparedDetail?: string;
  imgClickLogKey?: string;
}

export const ComparedProductList: React.FC<ComparedProductListProps> = (data) => {
  const {
    title, oppProductList = [], description, cardSubType, cardId, cardType,
    onMoreClick, isProduct, rightSideType, isShowSite = false, logKey, logKeyComparedDetail, imgClickLogKey } = data;
  return (
    <ProductListGeneration
      cardId={cardId}
      cardType={cardType}
      cardSubType={cardSubType}
      isShowSite={isShowSite}
      data={oppProductList.slice(0, 5)}
      title={title}
      content={description}
      rightSideType={rightSideType}
      logKey={imgClickLogKey}  // 注意：这里传入的是 imgClickLogKey（图片点击埋点），而不是 logKey（"查看更多"按钮埋点）,ProductListGeneration 组件的 logKey prop 用于商品图片点击埋点                        
      otherContent={(item) => (<div>
        <ImgCard
          title={cardSubType === "OD_COMPARE_PRODUCT" ? '对比下游商品' : $t("global-1688-ai-app.select-product.LeftComponents.ComparedProductList.topx", "同关键词Top5热销品")}
          list={item?.sameCateHotSaleList}
        />
        <DifferenceCard
          title={cardSubType === "OD_COMPARE_PRODUCT" ? '1688商品vs下游商品差异对比' : $t("global-1688-ai-app.select-product.LeftComponents.ComparedProductList.nrvxb", "新品vs热销品差异对比")}
          status={item?.status}
          successText={$t("global-1688-ai-app.select-product.LeftComponents.ComparedProductList.dbcomplete", "对比完成")}
          compareText={$t("global-1688-ai-app.select-product.LeftComponents.ComparedProductList.zuo", "正在对比功能差异")}
          onDetailClick={() => {
            // 埋点：查看同款详情
            if (logKeyComparedDetail) {
              log.record(logKeyComparedDetail as `/${string}.${string}.${string}`, 'CLK', {
                productId: item?.detailData?.productId || '',
              });
            }
            onMoreClick('COMPARED_DETAIL_MODAL', {
              detailData: item?.detailData,
              summary: item?.summary,
              status: item?.status,
              isProduct,
            });
          }}
        />
      </div>)}
      onMoreClick={() => {
        // 埋点：查看对比列表详情
        if (logKey) {
          log.record(logKey as `/${string}.${string}.${string}`, 'CLK', {
            cardSubType,
            title: title || '',
          });
        }
        onMoreClick(cardSubType, data);
      }}
    />
  );
};