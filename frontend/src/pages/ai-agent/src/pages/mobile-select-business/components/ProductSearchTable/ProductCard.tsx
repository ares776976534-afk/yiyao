import React from 'react';
import type { TypeProductData } from '@/pages/select-business/components/ProductSearchTable/types';
import styles from './ProductCard.module.scss';
import { $t } from '@/i18n';

interface TypeProductCardProps {
  productData: TypeProductData;
}

const ProductCard: React.FC<TypeProductCardProps> = ({ productData }) => {
  const {
    imageUrl,
    title,
    itemPrice,
    coreAttributes = [],
    providerKjCustomTags = [],
    salesInfos = [],
    shipInfos = [],
    satisfyRequirements = [],
    aiAttentions = [],
  } = productData;
  console.log(productData);

  // 获取发货信息
  // const deliveryTimeInfo = shipInfos.find(info => info.label?.includes('小时') || info.label?.includes('揽收'));
  // const locationInfo = shipInfos.find(info => info.label?.includes('发货地'));

  // 获取销量信息
  // const salesInfo = salesInfos.find(info => info.label?.includes('售') || info.label?.includes('销'));

  // 满足的需求数量
  const satisfiedCount = satisfyRequirements.filter(req => req.isSatisfy).length;


  const providerKjCustomTagsList = providerKjCustomTags.filter(item => item !== '-').slice(0, 3);
  return (
    <div className={styles.productCard}>
      <img src={imageUrl} className={styles.productImage} alt={$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.ProductCard.cpimage", "产品图片")} />
      <div className={styles.productInfo}>
        <div className={styles.productDetails}>
          <span className={styles.productTitle}>{title}</span>

          {/* {(deliveryTimeInfo || locationInfo) && (
            <div className={styles.deliveryInfo}>
              {deliveryTimeInfo && (
                <>
                  <span className={styles.deliveryText}>{deliveryTimeInfo.value}</span>
                  {locationInfo && (
                    <img
                      src="https://img.alicdn.com/imgextra/i3/6000000003954/O1CN01JXq4ri1f4z9DJ3nGb_!!6000000003954-2-gg_dtc.png"
                      className={styles.separator}
                      alt="分隔符"
                    />
                  )}
                </>
              )}
              {locationInfo && (
                <span className={styles.locationText}>{locationInfo.value}</span>
              )}
            </div>
          )} */}
          <div className={styles.deliveryInfo}>
            {
              (shipInfos || []).filter(item => item.value !== '-').slice(0, 3).map((item, index, array) => {
                return (
                  <React.Fragment key={index}>
                    <span className={styles.locationText}>{item.label}:{item.value}</span>
                    {index < array.length - 1 && (
                      <img
                        src="https://img.alicdn.com/imgextra/i3/6000000003954/O1CN01JXq4ri1f4z9DJ3nGb_!!6000000003954-2-gg_dtc.png"
                        className={styles.separator}
                        alt={$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.ProductCard.fgf", "分隔符")}
                      />
                    )}
                  </React.Fragment>
                );
              })
            }
          </div>

          {providerKjCustomTagsList?.length > 0 && (
            <div className={styles.tagsContainer}>
              {providerKjCustomTagsList.map((attr, index) => (
                <div key={index} className={styles.tag}>
                  <span className={styles.tagText}>{attr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.priceInfo}>
          {itemPrice && <span className={styles.price}>¥{itemPrice}</span>}
          <div className={styles.salesInfo}>
            {
              (salesInfos || []).slice(0, 1).map(item => {
                return (
                  <span className={styles.salesText}>{item.label} {item.value}</span>
                );
              })
            }
          </div>
        </div>

        {/* {(satisfiedCount > 0 || aiAttentions.length > 0) && (
          <div className={styles.conditionsContainer}>
            {satisfiedCount > 0 && (
              <>
                <span className={styles.conditionsText}>满足{satisfiedCount}个条件</span>
                {aiAttentions.length > 0 && (
                  <img
                    src="https://img.alicdn.com/imgextra/i3/6000000003954/O1CN01JXq4ri1f4z9DJ3nGb_!!6000000003954-2-gg_dtc.png"
                    className={styles.separator}
                    alt="分隔符"
                  />
                )}
              </>
            )}
            {aiAttentions.slice(0, 3).map((attention, index) => (
              <React.Fragment key={index}>
                <span className={styles.featureText}>{attention}</span>
                {index < Math.min(aiAttentions.length - 1, 2) && (
                  <img
                    src="https://img.alicdn.com/imgextra/i3/6000000003954/O1CN01JXq4ri1f4z9DJ3nGb_!!6000000003954-2-gg_dtc.png"
                    className={styles.separator}
                    alt="分隔符"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ProductCard;

