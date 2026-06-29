import React from 'react';
import styles from './productCard.module.scss';

interface ProductCardProps {
  image: string;
  title: string;
  description: string;
  hasOverlay?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  description,
  hasOverlay = false
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={image}
          alt={title}
          className={hasOverlay ? styles.imageWithOverlay : styles.image}
        />
        {hasOverlay && <div className={styles.overlay} />}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <img
            src="https://img.alicdn.com/imgextra/i1/6000000002666/O1CN01xTMfHa1VZ509xmT4h_!!6000000002666-2-gg_dtc.png"
            alt="icon"
            className={styles.icon}
          />
          <span className={styles.title}>{title}</span>
          <img
            src="https://img.alicdn.com/imgextra/i1/6000000003904/O1CN01fervb91ei5KYpkdaA_!!6000000003904-2-gg_dtc.png"
            alt="badge"
            className={styles.badge}
          />
        </div>
        <span className={styles.description}>{description}</span>
      </div>
    </div>
  );
};

export default ProductCard;
