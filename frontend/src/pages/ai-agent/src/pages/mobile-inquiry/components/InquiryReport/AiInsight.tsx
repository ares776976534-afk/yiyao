import React from 'react';
import type { TypeAiInsightItem } from '../../types';
import styles from './AiInsight.module.scss';

interface TypeAiInsightProps {
  insights: TypeAiInsightItem[];
}

const AiInsight: React.FC<TypeAiInsightProps> = ({ insights }) => {
  return (
    <div className={styles.insightGrid}>
      {insights.map((insight, index) => (
        <div key={index} className={styles.insightItem}>
          <span className={styles.insightLabel}>{insight.cnKey}</span>
          <span className={styles.insightValue}>{insight.value}</span>
        </div>
      ))}
    </div>
  );
};

export default AiInsight;

