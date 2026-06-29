import React from "react";
import style from './index.module.css';
import FrostedGlass from '../FrostedGlass';

interface OrdinaryCommodityCardProps {
    imageUrl?: string;
    title?: React.ReactNode;
    content?: any[string];
    bottomContent?: React.ReactNode;
    otherContent?: React.ReactNode;
    riskStatus?: string;
    productUrl?: string;
    regionIcon?: string;
    platformIcon?: string;
    isShowSite?: boolean;
    logKey?: string;
    logParams?: Record<string, any>;
}

const OrdinaryCommodityCard: React.FC<OrdinaryCommodityCardProps> = ({
     imageUrl, title, content, bottomContent, otherContent, riskStatus, productUrl, regionIcon, platformIcon, isShowSite = false, logKey, logParams }) => {
    const hasImage = !!imageUrl; // 是否有图片

    const renderIcon = () => {
      if (!isShowSite) {
        return null;
      }
      if (platformIcon || regionIcon) {
          return (
            <div className={style.ordinaryCommodityCardIcon}>
              {platformIcon && <img src={platformIcon} />}
              {regionIcon && <img src={regionIcon} />}
            </div>
          );
      }
      return null;
    };
    return (
      <div className={style.ordinaryCommodityCard}>
        <div className={style.ordinaryCommodityCardContent}>
          {hasImage && (
            <FrostedGlass
              style={{ width: 42, height: 42, marginRight: 8 }}
              riskStatus={riskStatus}
              productUrl={productUrl || ''}
              imageUrl={imageUrl}
              logKey={logKey}
              logParams={logParams}
            />
                )}
          <div className={style.ordinaryCommodityCardContentRight}>
            <div className={style.ordinaryCommodityCardTitleContainer}>
              <div className={style.ordinaryCommodityCardTitle}>{title}</div>
              {renderIcon()}
            </div>
            {content}
            <div className={style.ordinaryCommodityCardBottomContent}>
              {bottomContent}
            </div>
          </div>
        </div>
        {otherContent}
      </div>
    );
};

export default OrdinaryCommodityCard;
