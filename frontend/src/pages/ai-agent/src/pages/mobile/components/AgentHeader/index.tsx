import React from 'react';
import styles from './index.module.scss';

export interface TypeAgentHeaderProps {
  title: string;
  icon: React.ReactNode;
  tags: string[];
  subtitle: string;
  children?: React.ReactNode;
}

const AgentHeader = ({ title, icon, tags, subtitle, children }: TypeAgentHeaderProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {icon}
          <span>
            {title}
          </span>
        </div>
        <div className={styles.headerContent}>
          <div className={styles.headerContentItem}>
            {tags.map((tag, index) => (
              <React.Fragment key={tag}>
                <div className={styles.headerContentItemText}>{tag}</div>
                {index < tags.length - 1 && (
                  <div className={styles.headerContentItemIcon} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className={styles.headerContentText}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AgentHeader;

