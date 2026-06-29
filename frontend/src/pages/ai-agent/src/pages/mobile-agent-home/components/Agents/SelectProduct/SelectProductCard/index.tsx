import React from 'react';
import styles from './index.module.scss';


interface TypeSelectProductCardProps {
  data: {
    title: string;
    image: string;
  };
  onClick?: () => void;
}

const SelectProductCard: React.FC<TypeSelectProductCardProps> = (props) => {
  const { data, onClick } = props;
  return (
    <div className={styles.selectProductCard} onClick={onClick}>
      <div className={styles.imageContainer}>
        <img src={data.image} alt={data.title} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.title}>{data.title}</div>
        {/* <div className={styles.description}>{data.description}</div> */}
      </div>
    </div>
  );
};

export default SelectProductCard;
