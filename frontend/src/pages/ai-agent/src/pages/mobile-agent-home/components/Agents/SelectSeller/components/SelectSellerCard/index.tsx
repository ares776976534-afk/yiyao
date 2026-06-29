import React from 'react';
import styles from './index.module.scss';
import { EnumSearchMode } from '@/pages/mobile-agent-home/enum';
import { PlanningIcon } from '@/components/Icon';
import { SearchOfferIcon, SearchProviderIcon } from '@/pages/select-business/components/ModeSelector/icons';
import { $t } from '@/i18n';


interface TypeSelectSellerCardProps {
  data: {
    title: string;
    image: string;
    model: EnumSearchMode;
  };
  onClick?: () => void;
}

const SelectSellerCard: React.FC<TypeSelectSellerCardProps> = (props) => {
  const { data, onClick } = props;

  const renderModelIcon = () => {
    switch (data.model) {
      case EnumSearchMode.SMART:
        return <PlanningIcon width="3.733vw" height="3.733vw" fill="currentColor" />;
      case EnumSearchMode.PRODUCT_TO_SUPPLIER:
        return <SearchOfferIcon width="3.733vw" height="3.733vw" />;
      case EnumSearchMode.DIRECT_SUPPLIER:
        return <SearchProviderIcon width="3.733vw" height="3.733vw" />;
      default:
        return null;
    }
  };
  const renderModelText = () => {
    switch (data.model) {
      case EnumSearchMode.SMART:
        return $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.SelectSellerCard.znms", "智能模式");
      case EnumSearchMode.PRODUCT_TO_SUPPLIER:
        return $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.SelectSellerCard.ypzs", "以品找商");
      case EnumSearchMode.DIRECT_SUPPLIER:
        return $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.SelectSellerCard.zsmerchant", "直搜商家");
      default:
        return null;
    }
    return null;
  };

  return (
    <div className={styles.selectSellerCard} onClick={onClick}>
      <div className={styles.imageContainer}>
        <img src={data.image} alt={data.title} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.modelContainer}>
          <div className={styles.modelIcon}>
            {renderModelIcon()}
          </div>
          <div className={styles.modelText}>{renderModelText()}</div>
        </div>
        <div className={styles.title}>{data.title}</div>
      </div>
    </div>
  );
};

export default SelectSellerCard;