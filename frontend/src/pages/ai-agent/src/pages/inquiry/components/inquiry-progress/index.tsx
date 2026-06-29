import React from 'react';
import RecordCard from './components/RecordCard';
import styles from './index.module.scss';
import type { InquiryConversationData } from './types';

interface TypeInquiryProgressProps {
  detail?: InquiryConversationData[];
  isTranslated?: boolean;
}

const InquiryProgress: React.FC<TypeInquiryProgressProps> = (props) => {
  const { detail = [], isTranslated = false } = props;
  return (
    <div className={styles.inquiryProgress}>
      <div className={styles.recordCardList}>
        {
          (detail || []).map((item) => (
            <RecordCard key={item.conversationId} data={item} isTranslated={isTranslated} />
          ))
        }
      </div>
    </div>
  );
};

export default InquiryProgress;
