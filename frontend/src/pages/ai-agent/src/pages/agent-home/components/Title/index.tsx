import React from 'react';
import styles from './index.module.css';

const Title = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.title}>{children}</div>;
};

export default Title;