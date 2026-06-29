import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { ImgCard, DifferenceCard } from '@/components/ChatFlow/SpecialCard';
import type { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface ComparedListProps {
  title?: string;
  oppProductList?: any[];
  description?: string;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  rightSideType?: string;
  logKey?: string;
  logKeyComparedDetail?: string;
}

export const ComparedList: React.FC<ComparedListProps> = (data) => {
  const {
    title, oppProductList = [], description, cardSubType, onMoreClick, rightSideType,
    logKey, logKeyComparedDetail,
  } = data;

  return (
    <ProductListGeneration
      data={oppProductList.slice(0, 5)}
      title={title}
      content={description}
      rightSideType={rightSideType}
      otherContent={(item) => (<div>
        <ImgCard
          title={item?.productCardTitle}
          list={item?.targetProduct?.mainImgUrl ? [item?.targetProduct] : []}
          emptyText={$t("global-1688-ai-app.select-product.PlatformComponents.ComparedList.zwtk", `${item?.targetProduct?.regionCn}${item?.targetProduct?.platform}暂无同款`, [item?.targetProduct?.regionCn, item?.targetProduct?.platform])}
        />
        <DifferenceCard
          title={item?.analysisCardTitle}
          status={item?.status}
          successText={item?.analysisResult || $t("global-1688-ai-app.select-product.PlatformComponents.ComparedList.dbcomplete", "对比完成")}
          compareText={item?.analysisResult || $t("global-1688-ai-app.select-product.PlatformComponents.ComparedList.zuo", "正在对比功能差异")}
          onDetailClick={() => {
            // 埋点：查看同款详情
            if (logKeyComparedDetail) {
              log.record(logKeyComparedDetail as `/${string}.${string}.${string}`, 'CLK', {
                productId: item?.targetProduct?.productId || '',
              });
            }
            onMoreClick('MIGRATED_COMPARED_DETAIL_MODAL', item);
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