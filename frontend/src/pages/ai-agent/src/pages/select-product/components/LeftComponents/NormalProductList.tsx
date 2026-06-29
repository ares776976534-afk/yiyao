import React, { useEffect, useRef } from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface NormalProductListProps {
  title?: string;
  oppProductList?: any[];
  description?: string;
  totalCount?: number;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  isProduct?: boolean;
  rightSideType?: string;
  isShowSite?: boolean;
  cardId?: string;
  cardType?: string;
  logKey?: string;
  imgClickLogKey?: string;
}

export const NormalProductList: React.FC<NormalProductListProps> = (data) => {
  const {
    title, totalCount, oppProductList = [], description, cardSubType, cardId, cardType
    , onMoreClick, isProduct, rightSideType, isShowSite = false, logKey, imgClickLogKey } = data;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasExpRef = useRef(false);

  // 使用 ref 存储最新的埋点参数，避免闭包陷阱
  const logParamsRef = useRef({
    cardSubType,
    title: title || '',
    totalCount: totalCount || 0,
  });

  // 更新 ref 中的埋点参数
  logParamsRef.current = {
    cardSubType,
    title: title || '',
    totalCount: totalCount || 0,
  };

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !logKey) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasExpRef.current) {
          hasExpRef.current = true;
          log.record(logKey as `/${string}.${string}.${string}`, 'EXP', {
            cardSubType: logParamsRef.current.cardSubType,
            title: logParamsRef.current.title,
            totalCount: logParamsRef.current.totalCount,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [logKey]);

  return (
    <div ref={wrapperRef}>
    <ProductListGeneration
      cardId={cardId}
      cardType={cardType}
      cardSubType={cardSubType}
      isShowSite={isShowSite}
      data={oppProductList.slice(0, 5)}
      title={title}
      content={description}
      rightSideType={rightSideType}
      moreText={
        $t("global-1688-ai-app.select-product.LeftComponents.NormalProductList.guea",
          `共${totalCount}${isProduct ? 
            `${$t('global-1688-ai-app.select-product.LeftComponents.NewProductList.ge', '个')}` : 
            $t('global-1688-ai-app.select-product.LeftComponents.NewProductList.k', '款')}商品，查看详情`,
          [totalCount, isProduct ? $t('global-1688-ai-app.select-product.LeftComponents.NewProductList.ge', '个') :
            $t('global-1688-ai-app.select-product.LeftComponents.NewProductList.k', '款')]
        )
      }
      onMoreClick={() => {
        // 埋点：查看商品列表详情
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
    </div>
  );
};
