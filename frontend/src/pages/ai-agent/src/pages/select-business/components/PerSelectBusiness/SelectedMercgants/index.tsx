import React, { useState } from 'react';
import { FastForwardDownIcon, QuestionnaireIcon } from '@/components/Icon';
import styles from './index.module.scss';
import classNames from 'classnames';
import { $t } from '@/i18n';

interface ImageSelectionCardProps {
  url?: string;
}

const SelectedMercgants: React.FC<ImageSelectionCardProps> = ({ url }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={classNames(styles.selectedMercgantsContainer, { [styles.collapsed]: isCollapsed })}>
      <div className={styles.header}>
        <span className={styles.title}>
          <span className={styles.questionnaireIcon}>
            <QuestionnaireIcon width={16} height={16} fill="currentColor" />
          </span>
          <span>{$t("global-1688-ai-app.select-business.PerSelectBusiness.SelectedMercgants.nea", "您已选择图片主体")}</span>
        </span>
        <div className={styles.collapseButton} onClick={handleCollapse}>
          <span className={styles.collapseText}>{isCollapsed ? $t("global-1688-ai-app.select-business.PerSelectBusiness.SelectedMercgants.zkview", "展开查看") : $t("global-1688-ai-app.select-business.PerSelectBusiness.SelectedMercgants.sq", "收起")}</span>
          <span className={styles.collapseIcon}>
            <FastForwardDownIcon />
          </span>
        </div>
      </div>
      {url && (
        <div className={styles.imageWrapper}>
          <div className={styles.mainImageContainer}>
            <img className={styles.mainImage} src={url} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedMercgants;
