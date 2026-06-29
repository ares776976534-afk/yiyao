import styles from './bigMode.module.scss';
import BigCard from './BigCard';
import { listDataProps } from '../interface';

interface BigModeProps {
  listData: listDataProps[];
}
const BigMode = ({ listData }: BigModeProps) => {
  return (
    <div className={styles.bigMode}>
      {listData.map((item, index) => (
        <BigCard
          key={item.productId}
          itemData={item}
          index={index}
        />
      ))}
    </div>
  );
};

export default BigMode;