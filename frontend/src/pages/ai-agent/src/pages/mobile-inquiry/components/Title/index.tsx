import React from 'react';
import styles from './index.module.scss';

interface TypeTitleProps {
  title: string;
}

const Title: React.FC<TypeTitleProps> = ({ title }) => {
  return (
    <div className={styles.title}>{title}</div>
  );
};

export default Title;

