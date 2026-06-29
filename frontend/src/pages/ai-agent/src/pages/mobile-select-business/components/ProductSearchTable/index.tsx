import React from 'react';
import type { TypeProductSearchTableProps } from '@/pages/select-business/components/ProductSearchTable/types';
import ProductCard from './ProductCard';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const ProductSearchTable: React.FC<TypeProductSearchTableProps> = ({ rawData }) => {
  const offerList = rawData?.offerInfo?.offerList || [];
  const aiRequirementAnalysis = rawData?.offerInfo?.aiRequirementAnalysis;

  // 计算完全满足和部分满足的数量
  const fullSatisfy = aiRequirementAnalysis?.fullSatisfy || 0;
  const partSatisfy = aiRequirementAnalysis?.partSatisfy || 0;
  const total = aiRequirementAnalysis?.total || offerList.length;
  const isDisplay = aiRequirementAnalysis?.isDisplay ?? false;

  return (
    <div className={styles.container}>
      {isDisplay && (
        <div className={styles.analysisSection}>
          <div className={styles.analysisHeader}>
            <div className={styles.indicator} />
            <span className={styles.analysisTitle}>{$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.AIxqfx", "AI需求分析")}</span>
          </div>
          <span className={styles.analysisText}>
            <span className={styles.normalText}>{$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.beep", `本次为您推荐${total}个产品，其中`, [total])}</span>
            <span className={styles.orangeText}>{fullSatisfy}</span>
            <span className={styles.normalText}>{$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.gmq", "个产品完全满足您的需求，")}</span>
            <span className={styles.greenText}>{partSatisfy} </span>
            <span className={styles.normalText}>{$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.gmq.2", "个产品部分满足您的需求。")}</span>
          </span>
        </div>
      )}

      <div className={styles.productList}>
        {offerList.map((product, index) => (
          <ProductCard key={product.itemId || index} productData={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductSearchTable;

