import React from 'react';
// import renderContent from '../components/RenderContent';
import styles from './index.module.css';

const QwenCite = ({ children, url, className, ...props }) => {
  const combinedClassName = className
    ? `qwen-cite ${className}`
    : 'qwen-cite';

  // console.log('url', url, props);

  // return url.includes('bailian.console.aliyun.com') ? renderContent(children) : (
  //   <a
  //     href={url || '#'}
  //     target="_blank"
  //     rel="noopener noreferrer"
  //     className={`${styles.qwenCite} ${combinedClassName}`}
  //     {...props}
  //   >
  //     {children}
  //     {/* <span className={styles.qwenCiteIcon} /> */}
  //   </a>
  // );
  return (
    <a
      {...props}
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.qwenCite} ${combinedClassName}`}
    >
      {children}
      {/* <span className={styles.qwenCiteIcon} /> */}
    </a>
  );
};

export default QwenCite;

