import React from 'react';
import styles from './index.module.scss';


interface TypeInquiryCardProps {
  data: {
    title: string;
    image: string;
  };
  onClick?: () => void;
}

const InquiryCard: React.FC<TypeInquiryCardProps> = (props) => {
  const { data, onClick } = props;
  return (
    <div className={styles.inquiryCard} onClick={onClick}>
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

export default InquiryCard;
