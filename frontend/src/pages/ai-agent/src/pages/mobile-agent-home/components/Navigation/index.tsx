import React, { useState } from 'react';
import styles from './index.module.scss';
import { AgentType } from '../../enum';
import classNames from 'classnames';

interface NavigationItem {
  icon: React.ReactNode;
  text: string;
  id: AgentType;
}

interface NavigationProps {
  items: NavigationItem[];
  activeId?: AgentType;
  onItemClick?: (id: AgentType) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  activeId = 'product',
  onItemClick,
}) => {
  const [selectedId, setSelectedId] = useState(activeId);

  const handleItemClick = (id) => {
    setSelectedId(id);
    onItemClick?.(id);
  };

  return (
    <div className={styles.navigation}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: selectedId === item.id,
            })}
            onClick={() => handleItemClick(item.id)}
          >
            <span className={styles.navIcon}>
              {item.icon}
            </span>
            <span className={styles.navText}>
              {item.text}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Navigation;
