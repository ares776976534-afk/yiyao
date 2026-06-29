import React from 'react';
import styles from './tableItem.module.css';
import { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';
import { LoadImage } from './Button';

interface TableItemProps {
  title: string;
  description: string;
  url: string;
  isFirst: boolean;
  icon: string;
}

const TableItem: React.FC<TableItemProps> = ({ title, description, url, isFirst, icon }) => {
  const handleUrlClick = () => {
    window.open(url, '_blank');
    commonRecord(`查看网页检索`);
  };
  return (
    <div className={`${styles.newsItem} ${!isFirst ? styles.marginTop : ''}`}>
      <div className={styles.header}>
        <LoadImage src={icon} alt={title} className={styles.dot} />
        <span className={styles.title}>{title}</span>
      </div>
      <span className={styles.description}>{description}</span>
      <div className={styles.urlContainer}>
        <img
          className={styles.icon}
          src="https://img.alicdn.com/imgextra/i4/6000000002276/O1CN01G92Bug1SgSY01y3Hx_!!6000000002276-2-gg_dtc.png"
          alt="icon"
        />
        <span className={styles.url} onClick={handleUrlClick}>{url}</span>
      </div>
    </div>
  );
};

export default TableItem;
