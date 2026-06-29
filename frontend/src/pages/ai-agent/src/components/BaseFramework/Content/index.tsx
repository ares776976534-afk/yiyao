import React from 'react';
import styles from './index.module.css';

const AppContent = ({ children }) => {
  return (
    <div className={styles.content}>
      {children}
    </div>
  );
};

export default AppContent;