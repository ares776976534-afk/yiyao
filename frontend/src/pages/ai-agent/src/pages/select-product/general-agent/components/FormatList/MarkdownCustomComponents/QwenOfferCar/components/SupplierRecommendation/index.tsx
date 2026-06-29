import { App1688IconRedIcon, ArrowIcon, SuperFactoryNewIcon, OxheadIcon } from '@/components/Icon';
import styles from './index.module.css';
import ServiceCapabilityPopover from '../ServiceCapabilityPopover';
import type { TypeQwenOfferCard } from '../../index';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

const SupplierRecommendation = (props: TypeQwenOfferCard) => {
  const { providerInfoList, imageUrl, productId } = props;
  const { navigateByCache } = useChatQuery();
  const handleFindSupplier = (e) => {
    // 埋点：点击1688供应商推荐查看更多
    log.record(LOG_KEYS.GENERAL_AGENT.LP.SUPPLIER_MORE, 'CLK', {
      productId: productId || '',
      supplierCount: providerInfoList?.length || 0,
    });
    navigateByCache({
      chatInput: {
        searchImageUrl: imageUrl,
        intention: 'AUTO',
      },
      url: '/sourcing',
      isMakeSimilar: false,
      target: 'blank',
    });
  };
  return (
    <div className={styles.supplierRecommendation}>
      <div className={styles.supplierRecommendationHeader}>
        <div className={styles.supplierRecommendationHeaderTitle}>
          <App1688IconRedIcon />
          <div className={styles.supplierRecommendationHeaderTitleText}>1688供应商推荐</div>
        </div>
        <div className={styles.supplierRecommendationHeaderMore} onClick={handleFindSupplier}>
          <div>查看更多</div>
          <ArrowIcon />
        </div>
      </div>
      <div className={styles.providerInfoList}>
        {providerInfoList?.map((ele, eleIndex) => {
          const isSourceFactory = ele?.providerTags?.some((tag) => tag?.tagCode === 'SOURCE_FACTORY');
          const isSuperFactory = ele?.providerTags?.some((tag) => tag?.tagCode === 'SUPER_FACTORY');
          const isPowerFactory = ele?.providerTags?.some((tag) => tag?.tagCode === 'POWER_FACTORY');
          const SourceFactory = ele?.providerTags?.filter((tag) => tag?.tagCode === 'SOURCE_FACTORY')[0];
          // 渲染工厂图标：SUPER_FACTORY 优先，其次 POWER_FACTORY
          const renderFactoryIcon = () => {
            if (isSuperFactory) {
              return <SuperFactoryNewIcon />;
            }
            if (isPowerFactory) {
              return <OxheadIcon />;
            }
            return null;
          };

          const factoryIcon = renderFactoryIcon();
          const handleSupplierClick = () => {
            // 埋点：点击1688供应商推荐的供应商名称
            log.record(LOG_KEYS.GENERAL_AGENT.RECOMMEND.SUPPLIER_HOME, 'CLK', {
              productId: productId || '',
              companyName: ele?.companyName || '',
              supplierIndex: eleIndex,
              factoryUrl: ele?.factoryUrl || '',
            });
            window.open(ele?.factoryUrl, '_blank');
          };

          const handleOfferClick = () => {
            // 埋点：点击1688供应商推荐的商品卡片
            log.record(LOG_KEYS.GENERAL_AGENT.RECOMMEND.OD_PAGE, 'CLK', {
              productId: productId || '',
              companyName: ele?.companyName || '',
              supplierIndex: eleIndex,
              offerTitle: ele?.offerTitle || '',
              offerPrice: ele?.offerPrice || '',
              offerDetailUrl: ele?.offerDetailUrl || '',
            });
            window.open(ele?.offerDetailUrl, '_blank');
          };

          return (
            <div key={eleIndex} className={styles.supplierRecommendationContent}>
              <div className={styles.supplierRecommendationTop} onClick={handleSupplierClick}>
                <div className={styles.supplierRecommendationTopTitle}>{ele?.companyName}</div>
                <div className={styles.supplierRecommendationSub}>
                  {isSourceFactory && (
                    <>
                      <div className={styles.supplierRecommendationSubTag}>{SourceFactory?.tagName}</div>
                      {factoryIcon && factoryIcon}
                      <div className={styles.divider} />
                    </>
                  )}
                  {ele?.serviceLabels?.slice(0, 3).map((item, index, arr) => (
                    <div key={index} className={styles.supplierRecommendationSubItem}>
                      <div className={styles.supplierRecommendationSubRightItem}>{item?.value}{item?.label}</div>
                      {arr.length - 1 !== index && <div className={styles.divider} />}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.supplierRecommendationBottom} onClick={handleOfferClick}>
                <div className={styles.supplierRecommendationBottomImage}>
                  <img className={styles.supplierRecommendationBottomImageImg} src={ele?.offerImageUrl} alt="" srcSet="" />
                </div>
                <div className={styles.supplierRecommendationBottomContent}>
                  <div className={styles.supplierRecommendationBottomContentTitle}>{ele?.offerTitle}</div>
                  <div className={styles.supplierRecommendationBottomContentPriceContainer}>
                    <div className={styles.supplierRecommendationBottomContentPrice}>{ele?.offerPrice}</div>
                    <div className={styles.supplierRecommendationBottomContentSales}>售{ele?.offerSoldCnt}件</div>
                  </div>
                </div>
              </div>
              {ele?.providerKjCustomTags?.length > 0 && <ServiceCapabilityPopover {...ele} productId={productId} />}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default SupplierRecommendation;