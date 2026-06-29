import React from 'react';
import { Popover } from 'antd';
import styles from './productCard.module.css';

const items = [
  { num: 1, title: 'TikTok东南亚跨境物流成本' },
  { num: 2, title: 'TikTok Shop各站点发货费用详解' },
];

const ProductCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Popover
    placement="bottom"
    trigger="hover"
    overlayClassName={styles.popover}
    content={
      <div className={styles.cardBody}>
        {items.map((item, i) => (
          <React.Fragment key={item.num}>
            {i > 0 && <div className={styles.divider} />}
            <div className={i === 0 ? styles.headerRow : styles.headerRow2}>
              <span className={styles.numText}>{item.num}</span>
              <span className={styles.titleText}>{item.title}</span>
            </div>
            <div className={styles.subRow}>
              <img className={styles.iconImg} src="https://img.alicdn.com/imgextra/i2/6000000000489/O1CN01u3d67i1FU0nHcCuk8_!!6000000000489-2-gg_dtc.png" />
              <img className={styles.labelImg} src="https://img.alicdn.com/imgextra/i4/6000000004893/O1CN01UXsWiy1m134FMtizs_!!6000000004893-2-gg_dtc.png" />
            </div>
            <div className={styles.contentWrapper}>
              <span className={styles.descText}>…简短摘要简短摘要简短摘要，简短摘要简短摘要。简短摘要简短摘要简短摘要简短摘要简短摘要简短摘要，简短摘要简短摘要简短摘要，简短摘要简短摘要。简短摘要简短摘要简短摘要…</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    }
  >
    <span>{children}</span>
  </Popover>
);

export default ProductCard;
