import { getVersionComponent } from '@/utils/versionRouter';
import styles from './index.module.css';
import React from 'react';

interface TypeNavigationProps {
  className?: string;
  items: any[];
  selectedId: string;
  handleItemClick: (id: string) => void;
  isAnimating: boolean;
  isCompleted: boolean;
  style?: React.CSSProperties;
}

const Navigation = ({ className, items, selectedId, handleItemClick, isAnimating, isCompleted, style }: TypeNavigationProps) => (
  <div className={`${styles.navigation} ${className || ''}`} style={style}>
    <span className={styles.navigationLeftLine} />
    {items.map((item, index) => {
      const isActive = selectedId === item.id;
      return (
        <React.Fragment key={item.id}>
          <div
            className={`${isActive ? styles.navItemActive : styles.navItem} ${isActive && isCompleted ? styles.navItemCompleted : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            {isActive && isAnimating && (
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBar} />
              </div>
            )}
            <span className={isActive ? styles.navIconActive : styles.navIcon}>{item.icon}</span>
            <span className={isActive ? styles.navTextActive : styles.navText}>{item.text}</span>
          </div>
          {index < items.length - 1 && <span className={styles.navigationLine} />}
        </React.Fragment>
      );
    })}
    <span className={styles.navigationRightLine} />
  </div>
);

const Cn = (props: Omit<TypeNavigationProps, 'style'>) => <Navigation {...props} />;
const Global = (props: Omit<TypeNavigationProps, 'style'>) => <Navigation {...props} style={{ gap: '6px', fontFamily: 'Poppins' }} />;

export default getVersionComponent({
  CN: Cn,
  GLOBAL: Global,
});