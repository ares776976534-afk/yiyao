import type { IndexBlockProps } from './types';

import styles from './index.module.css';

const IndexBlock = ({
  title,
  subTitle,
  right,
  children,
  contentClassName,
}: IndexBlockProps) => {
  return (
    <div className={styles.indexBlock}>
      {title && <div className={styles.indexBlockHeader}>
        <div className={styles.indexBlockHeaderTitle}>
          <div className={styles.indexBlockHeaderTitleMain}>{title}</div>
          {subTitle && (
            <div className={styles.indexBlockHeaderTitleSub}>{subTitle}</div>
          )}
        </div>
        {right && (
          <div className={styles.indexBlockHeaderRight}>{right}</div>
        )}
      </div>}
      <div className={`${title ? styles.indexBlockContent : styles.indexBlockContentNoTitle} ${contentClassName || ''}`}>
        {children}
      </div>
    </div>
  )
}


export default IndexBlock;
