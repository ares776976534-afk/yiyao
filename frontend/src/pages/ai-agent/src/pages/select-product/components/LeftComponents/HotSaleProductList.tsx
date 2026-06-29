import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { ImgCard } from '@/components/ChatFlow/SpecialCard';
import type { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface HotSaleProductListProps {
  oppProductList?: any[];
  title?: string;
  description?: string;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  isProduct?: boolean;
  rightSideType?: string;
  isShowSite?: boolean;
  cardId?: string;
  cardType?: string;
  logKey?: string;
  logKeyHotDetail?: string;
  imgClickLogKey?: string;
}

export const HotSaleProductList: React.FC<HotSaleProductListProps> = (data) => {
  const {
    oppProductList = [], title, description, cardSubType, onMoreClick, isProduct,
    rightSideType, isShowSite = false, cardId, cardType, logKey, logKeyHotDetail, imgClickLogKey,
  } = data;
  return (
    <ProductListGeneration
      cardId={cardId}
      cardType={cardType}
      cardSubType={cardSubType}
      data={oppProductList.slice(0, 5)}
      title={title}
      isShowSite={isShowSite}
      rightSideType={rightSideType}
      content={description}
      logKey={imgClickLogKey} // 注意：这里传入的是 imgClickLogKey（图片点击埋点），而不是 logKey（"查看更多"按钮埋点),ProductListGeneration 组件的 logKey prop 用于商品图片点击埋点                        
      otherContent={(item) => (
        <div>
          <ImgCard
            title={$t("global-1688-ai-app.select-product.LeftComponents.HotSaleProductList.topx", "同关键词Top5热销品")}
            list={item?.sameCateHotSaleList}
            imgClickLogKey={imgClickLogKey}
            onDetailClick={() => {
              // 埋点：查看热销商品详情
              if (logKeyHotDetail) {
                log.record(logKeyHotDetail as `/${string}.${string}.${string}`, 'CLK', {
                  productId: item?.detailData?.productId || '',
                });
              }
              onMoreClick('HOT_DETAIL_MODAL', {
                detailData: item?.detailData,
                isProduct,
              });
            }}
          />
        </div>)}
      onMoreClick={() => {
        // 埋点：查看热销列表详情
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