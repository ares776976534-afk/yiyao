import React from 'react';
import ImageSearchItemInfoCard from '@/components/ChatFlow/ImageSearchItemInfoCard';
import { $t } from '@/i18n';

const ProductAbstractInfo = (props: any) => {
  const { componentData, index } = props;
  return (
    <div>
      <ImageSearchItemInfoCard
        index={index}
        radarTitle={$t("global-1688-ai-app.select-product.RightComponents.ProductReportBoard.jhzs", "机会分")}
        data={componentData}
      />
    </div>
  );
};

export default ProductAbstractInfo;
