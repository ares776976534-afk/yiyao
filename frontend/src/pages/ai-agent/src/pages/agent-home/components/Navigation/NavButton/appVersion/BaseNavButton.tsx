import type { CSSProperties, ReactNode } from 'react';

import styles from '../../index.module.css';

interface TypeNavButtonProps {
  item: {
    id: string;
    icon: ReactNode;
    text: string;
  };
  isActive: boolean;
  handleItemClick: (id: string) => void;
  style?: CSSProperties;
  className?: string;
}

const BaseNavButton = ({
  item,
  isActive,
  handleItemClick,
  style,
  className,
}: TypeNavButtonProps) => {
  return (
    <div
      data-tour={isActive ? 'tour-step-2' : ''}
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${className || ''}`}
      style={style}
      onClick={() => handleItemClick(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleItemClick(item.id);
        }
      }}
    >
      <span className={isActive ? styles.navIconActive : styles.navIcon}>
        {item.icon}
      </span>
      <span
        className={`${styles.navText} ${isActive ? styles.navTextActive : styles.navText}`}
      >
        {item.text}
      </span>
    </div>
  );
};

export default BaseNavButton;
