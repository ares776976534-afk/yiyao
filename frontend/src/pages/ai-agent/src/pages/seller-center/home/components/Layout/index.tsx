import React from 'react';
import Navigation from '../Navigation';
import styles from './index.module.scss';
import Footer from './Footer';

const Layout = ({ children, className, type, layoutStyle = {}, contentStyle = {}, hiddenFooter = false, hiddenHeader = false }: { children: React.ReactNode, className?: string, type?: string, layoutStyle?: React.CSSProperties, contentStyle?: React.CSSProperties, hiddenFooter?: boolean, hiddenHeader?: boolean }) => {
  return (
    <div className={`${styles.container} ${className}`} style={{ backgroundColor: '#FFF', ...layoutStyle }}>
      <div className={`${styles.header} ${type === 'simple' ? styles.simple : ''} ${hiddenHeader ? 'opacity-0' : 'opacity-100'}`}>
        <Navigation type={type as 'default' | 'simple'} />
      </div>
      <div className={styles.content} style={{ ...contentStyle }}>
        {children}
      </div>
      {!hiddenFooter && <Footer />}
    </div>
  ); 
};

export default Layout;