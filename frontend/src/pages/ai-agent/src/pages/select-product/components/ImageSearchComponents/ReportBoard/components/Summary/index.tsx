import React from 'react';
import { Markdown } from '@/components/ChatFlow/Markdown';
import styles from './index.module.scss';

const Summary: React.FC<{
  summary: string;
}> = (props) => {
  const { summary } = props;
  return (
    <div className={styles.summaryContainer}>
      <Markdown text={summary} />
    </div>
  );
};

export default Summary;
