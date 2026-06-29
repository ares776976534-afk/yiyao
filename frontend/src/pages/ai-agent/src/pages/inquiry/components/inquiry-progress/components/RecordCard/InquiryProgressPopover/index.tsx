import React from 'react';
import styles from './index.module.scss';
import { Checkmark2Icon } from '@/components/Icon';
import classNames from 'classnames';
import { $t } from '@/i18n';

interface TypeInquiryItem {
  q: string;
  isFinished: boolean;
}
interface TypeInquiryProgressPopoverProps {
  items?: TypeInquiryItem[];
}


const InquiryProgressPopover: React.FC<TypeInquiryProgressPopoverProps> = ({ items = [] }) => {
  return (
    <div className={styles.container}>
      <span className={styles.title}>{$t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.InquiryProgressPopover.xpjz", "询盘进展")}</span>
      <div className={styles.contentList}>
        {items.map((item, index) => (
          <div key={index} className={styles.inquiryItem}>
            {/* <img
              src={item.icon}
              className={styles.icon}
              alt="icon"
            /> */}
            <span className={classNames(styles.icon, {
              [styles.completed]: item.isFinished,
            })}
            >
              <Checkmark2Icon width={12} height={12} />
            </span>
            <span className={styles.text}>{item.q}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InquiryProgressPopover;

