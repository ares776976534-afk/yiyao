import { Popover } from 'antd';
import styles from './index.module.css';
import { Start3Icon, DownArrowIcon } from '@/components/Icon';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

const ServiceCapabilityPopover = (props) => {
  const { providerKjCustomTags, productId, companyName } = props;
  
  // 将数据分组，每三个一行
  const chunkedTags = [];
  for (let i = 0; i < (providerKjCustomTags?.length || 0); i += 3) {
    chunkedTags.push(providerKjCustomTags.slice(i, i + 3));
  }

  const content = (
    <div className={styles.serviceCapabilityPopoverContent}>
      {chunkedTags.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.serviceCapabilityPopoverRow}>
          {row?.map((ele, index) => (
            <div key={index} className={styles.serviceCapabilityPopoverContentItem}>{ele}</div>
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <Popover
      content={content}
      title={
        <div className={styles.serviceCapabilityPopoverTitle}>
          <div className={styles.serviceCapabilityPopoverTitleText}>服务能力</div>
          <div className={styles.serviceCapabilityPopoverTitleTextCount}>共{providerKjCustomTags?.length}项</div>
        </div>
      }
      rootClassName={styles.serviceCapabilityPopover}
    >
      <div
        className={styles.supplierRecommendationBottomMore}
        onMouseEnter={() => {
          log.record(LOG_KEYS.GENERAL_AGENT.LP.SERVICE_CAPABILITY_HOVER, 'OTHER', {
            productId: productId || '',
            companyName: companyName || '',
            tagCount: providerKjCustomTags?.length || 0,
          });
        }}
      >
        <div className={styles.supplierRecommendationBottomMoreLeft}>
          <div className={styles.supplierRecommendationBottomMoreLeftItem}>
            <Start3Icon />
            <div className={styles.supplierRecommendationBottomMoreLeftItemText}>服务能力</div>
          </div>
          <div className={styles.supplierRecommendationBottomMoreContent}>
            {providerKjCustomTags?.slice(0, 3).map((ele, index) => (
              <div key={index} className={styles.supplierRecommendationBottomMoreContentItem}>{ele}</div>
            ))}
          </div>
          <div className={styles.maskLayer} />
        </div>
        <div className={styles.supplierRecommendationBottomMoreRight}>
          <div className={styles.supplierRecommendationBottomMoreRightText}>共{providerKjCustomTags?.length}项</div>
          <span className={styles.arrowIcon}>
            <DownArrowIcon fill={'var(--text-accent)'} width={12} height={12} />
          </span>
        </div>
      </div>
    </Popover>
  );
};

export default ServiceCapabilityPopover;