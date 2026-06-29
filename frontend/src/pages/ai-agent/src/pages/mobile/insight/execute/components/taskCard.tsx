import { DownArrowIcon } from '@/components/Icon';
import { useState, ReactNode } from 'react';
import styles from './taskCard.module.scss';
import { icons } from '@/pages/select-product/components/LeftComponents/AccordionItem';

interface taskCardProps {
  children: [];
  title: string;
  icon: string;
}

const taskCard = ({
  children,
  title,
  icon
}: taskCardProps) => {
  const [isArrowRotated, setIsArrowRotated] = useState(false);
  const onDownArrow = () => {
    setIsArrowRotated(!isArrowRotated);
  }
  return (
    <div className={styles.taskCard}>
      <div className={styles.taskCardHeader}>
        <div className={styles.taskCardHeaderTitle}>
          {icons[icon]}
          <div className={styles.taskCardTitle}>{title}</div>
        </div>
        <div onClick={onDownArrow} className={!isArrowRotated ? styles.arrowIconRotated : styles.arrowIcon}>
          <DownArrowIcon width="14px" height="14px"/>
        </div>
      </div>
      {!isArrowRotated && children?.length > 0 && (
        <div className={styles.taskCardContent}>
          {children}
        </div>
      )}
    </div>
  )
};

export default taskCard;