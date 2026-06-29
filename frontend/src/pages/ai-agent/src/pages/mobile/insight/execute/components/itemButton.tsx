import styles from './itemButton.module.scss';
import { CommodityIcon } from "@/components/Icon";

const ItemButton = ({
  title,
  description
}) => {
  return (
    <div className={styles.itemButton}>
      <div className={styles.itemButtonHeader}>
        <CommodityIcon fill="var(--icon-primary" width={16} height={16} />
        <span className={styles.itemButtonHeaderTitle}>{title}</span>
      </div>
      {description && (
        <div className={styles.itemButtonContent}>
          {description}
        </div>
      )}
    </div>
  )
}

export default ItemButton;