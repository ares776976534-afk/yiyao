import React from 'react';
import styles from './index.module.scss';
import { Checkmark2Icon } from '@/components/Icon';
import { CloseIcon } from '@/components/Icons';
import { TypeSatisfyRequirement } from '../ProductSearchTable/types';
import classNames from 'classnames';
import { $t } from '@/i18n';

interface TypeDemandAnalysisPopoverProps {
  items?: TypeSatisfyRequirement[];
}


const DemandAnalysisPopover: React.FC<TypeDemandAnalysisPopoverProps> = ({ items = [] }) => {
  return (
    <div className={styles.container}>
      {(items || []).map((item, index) => (
        <div key={index} className={styles.productItem}>
          <div className={styles.headerSection}>
            <div className={styles.titleRow}>
              <span className={styles.productTitle}>{item.requirement}</span>
              <div className={item.isSatisfy ? styles.statusTag : styles.statusTagUnsatisfied}>
                <span className={classNames(styles.statusIcon, {
                  [styles.isSatisfy]: item.isSatisfy,
                })}
                >
                  {item.isSatisfy ? <Checkmark2Icon /> : <CloseIcon />}
                </span>
                <span className={item.isSatisfy ? styles.statusText : styles.statusTextUnsatisfied}>
                  {item.isSatisfy ? $t("global-1688-ai-app.select-business.DemandAnalysisPopover.mzxq", "满足需求") : $t("global-1688-ai-app.select-business.DemandAnalysisPopover.bmz", "不满足")}
                </span>
              </div>
            </div>
            {item.indicatorContent && (
              <div className={styles.description} dangerouslySetInnerHTML={{ __html: item.indicatorContent }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DemandAnalysisPopover;

