import React from 'react';
import styles from './index.module.css';

interface TypeCreditCardProps {
  value: string | number;
  label: string;
  background?: string;
  borderColor?: string;
}

export const CreditCard: React.FC<TypeCreditCardProps> = ({
  value,
  label,
  background,
  borderColor,
}) => {
  const cardStyle: React.CSSProperties = {
    border: '1px solid',
  };

  if (background) {
    cardStyle.background = background;
  }
  if (borderColor) {
    cardStyle.borderColor = borderColor;
  }

  return (
    <div className={styles.creditCard} style={cardStyle}>
      <div className={styles.creditCardContent}>
        <div className={styles.creditCardNumber}>{value}</div>
        <div className={styles.creditCardLabel}>{label}</div>
      </div>
    </div>
  );
};
