import React from 'react';
import { checkAuthAndLogin } from '@/utils/login';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import styles from './priceCard.module.scss';
import { $t } from '@/i18n';

interface PricingCardProps {
  id?: string;
  packageId?: string;
  packageName?: string;
  actualFee?: string;
  totalPoint?: string;
  unitPointPrice?: string;
  packageDesc?: any[];
}

const PricingCard: React.FC<PricingCardProps> = ({ id, packageId, packageName, actualFee, totalPoint, unitPointPrice, packageDesc = [] }) => {
  const navigate = useNavigateWithScroll();
  const handleClick = async () => {
    const isLogin = await checkAuthAndLogin()
    if (isLogin) {
      navigate(`/seller-center/home/api-list/api-pay?packageId=${packageId}`, { replace: true });
    }
  };
  return (
    <div id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.title}>{packageName}</span>
            <div className={styles.priceSection}>
              <div className={styles.priceContainer}>
                <div className={styles.currencyContainer}>
                  <span className={styles.currencySymbol}>&yen;</span>
                  <span className={styles.currency}>{actualFee}</span>
                </div>
                {/* <span className={styles.price}>2099</span> */}
              </div>
              {/* <span className={styles.period}>/年</span> */}
            </div>
          </div>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.features}>
          <div className={styles.pointsInfo}>
            <span className={styles.pointsText}>
              <span className={styles.normalText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.PriceCard.bh", "包含")}</span>
              <span className={styles.boldText}>{totalPoint}</span>
              <span className={styles.normalText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.PriceCard.points", "积分")}</span>
            </span>
            <span className={styles.pricePerPoint}>
              <span className={styles.boldText}>= {unitPointPrice} </span>
              <span className={styles.normalText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.PriceCard.ypoints", "元/积分")}</span>
            </span>
          </div>

          <div className={styles.description}>
            {
              packageDesc.map((item) => (
                <div className={styles.descriptionItem}>
                  <img
                    src="https://img.alicdn.com/imgextra/i2/6000000007072/O1CN01Xmfttx22724HOLMHA_!!6000000007072-2-gg_dtc.png"
                    className={styles.icon}
                    alt="check"
                  />
                  <span className={styles.descriptionText}>
                    {item}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        <div className={styles.purchaseButton} onClick={handleClick}>
          <span className={styles.buttonText}>{$t("global-1688-ai-app.seller-center.home.api-list.APIPackage.PriceCard.iiy", "立即购买")}</span>
        </div>
      </div>

      {/* <div className={styles.badge}>
        <span className={styles.badgeText}>最佳推荐</span>
      </div> */}
    </div>
  );
};

export default PricingCard;
