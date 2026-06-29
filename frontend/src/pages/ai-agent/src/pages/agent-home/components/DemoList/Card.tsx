import React from 'react';
import styles from './card.module.css';

interface ButtonConfig {
  text: string;
  icon: string;
  onClick: () => void;
}

interface ProductCardProps {
  image?: string;
  tagIcon: string;
  tagText: string;
  description: string;
  isSpecial?: boolean;
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  tagIcon,
  tagText,
  description,
  isSpecial = false,
  primaryButton,
  secondaryButton
}) => {

  return (
    <div className={`${styles.card} ${isSpecial ? styles.cardSpecial : ''}`}>
      <div className={styles.cardImage}>
        {image && <img src={image} alt="" className={styles.image} />}
        {isSpecial && (primaryButton || secondaryButton) && (
          <div className={styles.overlayWrapper}>
            <div className={styles.overlay}>
              {primaryButton && (
                <button
                  className={styles.buttonPrimary}
                  onClick={primaryButton.onClick}
                >
                  <img className={styles.buttonIcon} src={primaryButton.icon} alt="" />
                  <span className={styles.buttonText}>{primaryButton.text}</span>
                </button>
              )}
              {secondaryButton && (
                <button
                  className={styles.buttonSecondary}
                  onClick={secondaryButton.onClick}
                >
                  <img className={styles.buttonIcon} src={secondaryButton.icon} alt="" />
                  <span className={styles.buttonSecondaryText}>{secondaryButton.text}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={styles.cardContent}>
        {(tagIcon || tagText) && (
          <div className={styles.cardTag}>
            {tagIcon && <img className={styles.tagIcon} src={tagIcon} alt="" />}
            {tagText && <span className={styles.tagText}>{tagText}</span>}
          </div>
        )}
        <span className={styles.cardDescription}>{description}</span>
      </div>
    </div>
  );
};

export default ProductCard;
