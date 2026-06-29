import type { CSSProperties, ReactNode } from 'react';
import { getVersionComponent } from '@/utils/versionRouter';
import styles from '../index.module.css';

interface TypeCardProps {
  children: ReactNode;
  activeIndex: number | null;
  index: number;
  handleClick: (index: number) => void;
  style?: CSSProperties;
}

const Card = ({ children, activeIndex, index, handleClick, style }: TypeCardProps) => (
  <div
    className={`${styles.tabCard} ${activeIndex === index ? styles.active : ''}`}
    onClick={() => handleClick(index)}
    style={style}
  >
    {children}
  </div>
);

export default getVersionComponent({
  CN: (props: Omit<TypeCardProps, 'style'>) => <Card {...props} />,
  GLOBAL: (props: Omit<TypeCardProps, 'style'>) => <Card {...props} style={{ width: '280px' }} />,
});