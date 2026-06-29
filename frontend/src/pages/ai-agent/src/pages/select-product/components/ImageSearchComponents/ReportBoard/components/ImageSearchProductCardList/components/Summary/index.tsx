import React, { useMemo } from 'react';
import { Markdown } from '@/components/ChatFlow/Markdown';
import styles from './index.module.scss';
import { EnumProductCardType } from '../../productCardRenderer';

const Summary: React.FC<{
  componentData?: {
    summary?: string;
    compareSummary?: string;
    improvementSuggestionSummary?: string;
  };
  title?: string;
  type: string;
}> = (props) => {
  const { componentData, type, title } = props;
  // const { summary, compareSummary, improvementSuggestionSummary } = componentData || {};
  // const { title } = componentData || {};

  const summary = useMemo(() => {
    switch (type) {
      case EnumProductCardType.PRODUCT_SUMMARY:
        return componentData?.summary;
      case EnumProductCardType.PRODUCT_IMPROVE_SUMMARY:
        return componentData?.improvementSuggestionSummary;
      case EnumProductCardType.PRODUCT_COMPARE_SUMMARY:
        return componentData?.compareSummary;
      default:
        return componentData?.summary;
    }
  }, [type, componentData]);

  if (!summary) {
    return null;
  }

  return (
    <div
      data-key={type}
      className={`${styles.summaryContainer} ${type === EnumProductCardType.PRODUCT_SUMMARY ? styles.productSummaryContainer : ''}`}
    >
      {
        title
          ? <div className={styles.titleSection}>
            <div className={styles.dot} />
            <span className={styles.titleText}>{title}</span>
          </div>
      : null
      }

      {/*  */}
      <Markdown text={summary} />
    </div>
  );
};

export default Summary;
