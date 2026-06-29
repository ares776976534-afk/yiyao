import React from 'react';
import styles from './doneCard.module.scss';
import { $t } from '@/i18n';

interface DoneCardProps {
  icon: string;
  serviceName: string;
  unitPriceInfo: string;
  jumpUrl?: string;
  onClick?: () => void;
  className?: string;
}

const DoneCard: React.FC<DoneCardProps> = ({
  icon,
  serviceName,
  unitPriceInfo,
  jumpUrl,
  onClick,
  className = "",
  ...props
}) => {
  const handleClick = () => {
    if (jumpUrl) {
      window.open(jumpUrl, '_blank', 'noopener,noreferrer');
    } else {
      onClick?.();
    }
  };

  return (
    <div
      className={`${styles.card} ${className}`}
      onClick={handleClick}
      {...props}
    >
      <div className={styles.iconContainer}>
        <img
          src={icon}
          alt={serviceName}
        />
      </div>

      <div className={styles.content}>
        <span className={styles.title}>
          {serviceName}
        </span>
        <span className={styles.subtitle}>
          {unitPriceInfo}
        </span>
        {jumpUrl && (
          <span className={styles.jumpLink}>
            {$t('global-1688-ai-app.seller-center.home.api-list.APIPackage.viewDetail', '点击查看详情')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DoneCard;
