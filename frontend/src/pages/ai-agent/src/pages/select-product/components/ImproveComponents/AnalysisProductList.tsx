import React from 'react';
import ProductListGeneration from '@/components/ChatFlow/ProductListGeneration';
import { DifferenceCard } from '@/components/ChatFlow/SpecialCard';
import type { TypeRightPanelSide } from '@/types/select-product';
import { $t } from '@/i18n';
import log from '@/utils/log';

interface AnalysisProductListProps {
  title?: string;
  oppProductList?: any[];
  description?: string;
  cardSubType: TypeRightPanelSide;
  onMoreClick: (cardSubType: TypeRightPanelSide, data: any) => void;
  rightSideType?: string;
  logKey?: string;
  logKeyAnalysisDetail?: string;
}

export const AnalysisProductList: React.FC<AnalysisProductListProps> = (data) => {
  const {
    title, oppProductList = [], description, cardSubType, onMoreClick, rightSideType,
    logKey, logKeyAnalysisDetail,
  } = data;

  return (
    <ProductListGeneration
      data={oppProductList?.slice(0, 5)}
      title={title}
      content={description}
      rightSideType={rightSideType}
      otherContent={(item) => (<div>
        <DifferenceCard
          title={$t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductList.ggo", "改进建议分析")}
          status={item?.status}
          successText={item?.analysisResult || $t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductList.fxcomplete", "分析完成")}
          compareText={item?.analysisResult || $t("global-1688-ai-app.select-product.ImproveComponents.AnalysisProductList.zrtte", "正在分析商品差评")}
          onDetailClick={() => {
            // 埋点：查看分析详情
            if (logKeyAnalysisDetail) {
              log.record(logKeyAnalysisDetail as `/${string}.${string}.${string}`, 'CLK', {
                productId: item?.productId || '',
              });
            }
            onMoreClick('ANALYSIS_DETAIL_MODAL', item);
          }}
        />
      </div>)}
      onMoreClick={() => {
        // 埋点：查看改进分析列表详情
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