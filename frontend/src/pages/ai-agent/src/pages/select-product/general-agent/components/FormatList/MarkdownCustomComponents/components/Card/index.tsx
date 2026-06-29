import React from 'react';
import styles from './index.module.css';

interface TypeCardProps {
  children: React.ReactNode;
  className?: string;
  class?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<TypeCardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`${styles.card} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;