import React from 'react';
import type { TypeSupplierData } from '@/pages/select-business/components/SupplierSearchTable/types';
import styles from './SupplierCard.module.scss';
import { $t } from '@/i18n';

interface TypeSupplierCardProps {
  supplierData: TypeSupplierData;
}

const SupplierCard: React.FC<TypeSupplierCardProps> = ({ supplierData }) => {
  const {
    companyName,
    factoryUrl,
    providerTags = [],
    providerServices = [],
    recommendItems = [],
    satisfyRequirements = [],
    aiAttentions = [],
    providerKjCustomTags = [],
  } = supplierData;

  // 获取供应商头像（使用第一个推荐商品的图片作为默认）
  const supplierImage = recommendItems[0]?.imageUrl || 'https://img.alicdn.com/imgextra/i2/6000000005850/O1CN01CV3c0c1t5M5X8VL43_!!6000000005850-2-gg_dtc.png';

  // 满足的需求数量
  const satisfiedCount = satisfyRequirements.filter(req => req.isSatisfy).length;

  // 分隔符图片
  const separatorIcon = 'https://img.alicdn.com/imgextra/i3/6000000003954/O1CN01JXq4ri1f4z9DJ3nGb_!!6000000003954-2-gg_dtc.png';

  // 工厂图标
  const factoryIcon = 'https://img.alicdn.com/imgextra/i3/6000000000421/O1CN01AVDhJC1Eyrqa52U4B_!!6000000000421-2-gg_dtc.png';

  return (
    <div className={styles.supplierItem}>
      <img src={supplierImage} alt={$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.SupplierCard.gysimage", "供应商图片")} className={styles.supplierImage} />
      <div className={styles.supplierInfo}>
        <div className={styles.supplierDetails}>
          <div className={styles.supplierBasicInfo}>
            <span className={styles.supplierName}>{companyName}</span>

            {providerTags.length > 0 && (
              <div className={styles.supplierMeta}>
                {providerTags.slice(0, 2).map((tag, index) => (
                  <React.Fragment key={index}>
                    {tag.tagStyle === 'factory' && factoryUrl && (
                      <div className={styles.factoryInfo}>
                        <img src={factoryIcon} alt={$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.SupplierCard.gcicon", "工厂图标")} className={styles.factoryIcon} />
                        <span className={styles.factoryText}>{tag.tagName}</span>
                      </div>
                    )}
                    {tag.tagStyle !== 'factory' && (
                      <span className={styles.yearText}>{tag.tagName}</span>
                    )}
                    {index < Math.min(providerTags.length - 1, 1) && (
                      <img src={separatorIcon} alt={$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.SupplierCard.fgf", "分隔符")} className={styles.separator} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {providerServices.length > 0 && (
              <div className={styles.rateInfo}>
                {providerServices.slice(0, 2).map((service, index) => (
                  <React.Fragment key={index}>
                    <span className={styles.rateText}>{service.label}</span>
                    {index < Math.min(providerServices.length - 1, 1) && (
                      <img src={separatorIcon} alt={$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.SupplierCard.fgf", "分隔符")} className={styles.rateSeparator} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {providerKjCustomTags.length > 0 && (
              <div className={styles.tags}>
                {providerKjCustomTags.slice(0, 3).map((tag, index) => (
                  <div key={index} className={styles.tag}>
                    <span className={styles.tagText}>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* {(satisfiedCount > 0 || aiAttentions.length > 0) && (
            <div className={styles.conditionInfo}>
              {satisfiedCount > 0 && (
                <>
                  <span className={styles.conditionText}>满足{satisfiedCount}个条件</span>
                  {aiAttentions.length > 0 && (
                    <img src={separatorIcon} alt="分隔符" className={styles.conditionSeparator} />
                  )}
                </>
              )}
              {aiAttentions.slice(0, 3).map((attention, index) => (
                <React.Fragment key={index}>
                  <span className={styles.conditionText}>{attention}</span>
                  {index < Math.min(aiAttentions.length - 1, 2) && (
                    <img src={separatorIcon} alt="分隔符" className={styles.conditionSeparator} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )} */}
        </div>

        {recommendItems.length > 0 && (
          <div className={styles.productImages}>
            {recommendItems.slice(0, 3).map((item, index) => (
              <img
                key={item.itemId || index}
                src={item.imageUrl}
                alt={$t("global-1688-ai-app.mobile-select-business.SupplierSearchTable.SupplierCard.cpimage", "产品图片")}
                className={styles.productImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCard;

