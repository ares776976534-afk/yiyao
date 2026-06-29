import styles from './index.module.scss';
import { createLink } from '@/pages/mobile-agent-home/components/Agents';
import showTaskLinkModal from '@/components/TaskLinkModel';
import { AgentType } from '@/pages/mobile-agent-home/enum';
import { InquiryDescription } from '@/pages/mobile/config';
import React from 'react';

export const InputContainer = ({ type }: { type: AgentType }) => {
  const handleClick = () => {
    createLink(type, {}).then(link => {
      const handler = showTaskLinkModal({
        onClose: () => {
          handler.close();
        },
        url: link,
      });
    });
  };
  return (
    <div className={styles.taskHeader}>
      <div className={styles.inputContainer} onClick={handleClick}>
        <div className={styles.boxShadow} />
        <img
          className={styles.mainImage}
          src="https://gw.alicdn.com/imgextra/i4/O1CN01gdAYgc1Ug7UOmymou_!!6000000002546-2-tps-864-331.png"
          alt="主图"
        />
      </div>
      <div className={styles.description}>
        {InquiryDescription.map((item, index) => (
          <React.Fragment key={item.label}>
            <div>{item.label}</div>
            {index !== InquiryDescription.length - 1 && <div className={styles.divider} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}