import React from 'react';
import styles from './index.module.scss';

interface TypeCommonChatCardProps {
  data: {
    title: string;
    image: string;
  };
  onClick?: () => void;
}

const CommonChatCard: React.FC<TypeCommonChatCardProps> = (props) => {
  const { data, onClick } = props;

  return (
    <div className={styles.commonChatCard} onClick={onClick}>
      <div className={styles.imageContainer}>
        <img src={data.image} alt={data.title} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.title}>{data.title}</div>
      </div>
    </div>
  );
};

export default CommonChatCard;