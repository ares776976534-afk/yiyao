import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { ImgCard } from '@/components/ChatFlow/SpecialCard';
import type { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface MigratedListProps {
  oppProductList?: any[];
  title?: string;
  description?: string;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  rightSideType?: string;
  logKey?: string;
  logKeyMigratedDetail?: string;
}

export const MigratedList: React.FC<MigratedListProps> = (data) => {
  const {
    oppProductList = [], title, description, cardSubType, onMoreClick, rightSideType,
    logKey, logKeyMigratedDetail,
  } = data;

  return (
    <ProductListGeneration
      data={oppProductList.slice(0, 5)}
      title={title}
      content={description}
      rightSideType={rightSideType}
      otherContent={(item) => {
        return (<div>
          <ImgCard
            title={item?.productCardTitle}
            list={item?.targetProduct?.mainImgUrl ? [item?.targetProduct] : []}
            onDetailClick={() => {
              // 埋点：查看迁移商品详情
              if (logKeyMigratedDetail) {
                log.record(logKeyMigratedDetail as `/${string}.${string}.${string}`, 'CLK', {
                  productId: item?.targetProduct?.productId || '',
                });
              }
              onMoreClick('MIGRATED_DETAIL_MODAL', item);
            }}
            emptyText={$t("global-1688-ai-app.select-product.PlatformComponents.MigratedList.zwtk", `${item?.targetProduct?.regionCn}${item?.targetProduct?.platform}暂无同款`, [item?.targetProduct?.regionCn, item?.targetProduct?.platform])}
          />
        </div>);
      }}
      onMoreClick={() => {
        // 埋点：查看迁移列表详情
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