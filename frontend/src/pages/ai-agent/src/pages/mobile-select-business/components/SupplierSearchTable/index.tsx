import React from 'react';
import type { TypeSupplierSearchTableProps } from '@/pages/select-business/components/SupplierSearchTable/types';
import SupplierCard from './SupplierCard';
import styles from './index.module.scss';
import { $t } from '@/i18n';

const SupplierSearchTable: React.FC<TypeSupplierSearchTableProps> = ({ rawData }) => {
  const providerList = rawData?.providerInfo?.providerList || [];
  const aiRequirementAnalysis = rawData?.providerInfo?.aiRequirementAnalysis;

  // 计算完全满足和部分满足的数量
  const fullSatisfy = aiRequirementAnalysis?.fullSatisfy || 0;
  const partSatisfy = aiRequirementAnalysis?.partSatisfy || 0;
  const total = aiRequirementAnalysis?.total || providerList.length;
  const isDisplay = aiRequirementAnalysis?.isDisplay ?? false;
  // aiRequirementAnalysis?.isDisplay ?? true;

  return (
    <div className={styles.container}>
      {isDisplay && (
        <div className={styles.analysisSection}>
          <div className={styles.analysisHeader}>
            <div className={styles.indicator} />
            <span className={styles.analysisTitle}>{$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.AIxqfx", "AI需求分析")}</span>
          </div>
          <span className={styles.analysisText}>
            <span className={styles.normalText}>{$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.beey", `本次为您推荐${total}个供应商，其中`, [total])}</span>
            <span className={styles.orangeText}>{fullSatisfy}</span>
            <span className={styles.normalText}>{$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.gqx", "个供应商完全满足您的需求，")}</span>
            <span className={styles.greenText}>{partSatisfy} </span>
            <span className={styles.normalText}>{$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.gfx", "个供应商部分满足您的需求。")}</span>
          </span>
        </div>
      )}

      <div className={styles.supplierList}>
        {providerList.map((supplier, index) => (
          <SupplierCard key={supplier.memberId || index} supplierData={supplier} />
        ))}
      </div>
    </div>
  );
};

export default SupplierSearchTable;

