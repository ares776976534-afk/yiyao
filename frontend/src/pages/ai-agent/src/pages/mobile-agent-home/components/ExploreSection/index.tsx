import React from 'react';
import styles from './index.module.scss';

interface TypeExploreSectionProps {
  // id?: string;
  title: string;
}

const ExploreSection: React.FC<TypeExploreSectionProps> = ({ title }) => {
  return (
    <div className={styles.exploreSection}>
      <div className={styles.leftLine} />
      <div className={styles.title}>{title}</div>
      <div className={styles.rightLine} />
    </div>
  );
};

export default ExploreSection;

