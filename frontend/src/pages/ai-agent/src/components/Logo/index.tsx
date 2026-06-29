import React from 'react';
import styles from './index.module.css';
import { useLargeScreen } from '@/hooks/useLargeScreen';
import { getVersionComponent } from '@/utils/versionRouter';
interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}
const cn = ({ className, style, onClick }: LogoProps) => {
  return (
    <div className={`${styles.logo} ${className}`} style={{ ...style, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <img src="https://img.alicdn.com/imgextra/i2/O1CN01nPQyGH26stwPS3K28_!!6000000007718-2-tps-265-72.png" alt="logo" />
    </div>
  )
}
const global = ({ className, style, onClick }: LogoProps) => {
  return (
    <div className={`${styles.logo} ${className}`} style={{ ...style, cursor: onClick ? 'pointer' : 'default', width: '175.38px', height: '24px' }} onClick={onClick}>
      <img src="https://img.alicdn.com/imgextra/i4/O1CN01WWPiMg1IT2nadnfJX_!!6000000000893-2-tps-527-72.png" alt="logo" />
    </div>
  )
};
export default getVersionComponent({
  CN: cn,
  GLOBAL: global,
});