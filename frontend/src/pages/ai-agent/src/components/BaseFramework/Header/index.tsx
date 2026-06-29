import React from 'react';
import styles from './index.module.css';

const AppHeader = ({ title, right }) => {
  return (title || right) && (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.divider}></div>
      </div>
      {right && (
        <div className={styles.headerRight}>{right}</div>
      )}
    </div>
  );
};

export default AppHeader;