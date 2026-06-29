import React from 'react';
import { renderProductCard, getProductCardRenderer } from './productCardRenderer';
import styles from './index.module.css';

const ImageSearchProductCardList: React.FC<{
  rawData: any;
  onActionClick?: (action: string, data: any) => void;
}> = ({ rawData, onActionClick }) => {
  if (rawData && Array.isArray(rawData)) {
    return (
      <div className={styles.productCardList}>
        {
          (rawData || []).map((item: any, index: number) => {
            const isLast = index === rawData.length - 1;
            return (
              <div key={index}>
                <div className={styles.productCardItem}>
                  {
                    (item || []).map((item2: any, index2: number) => {
                      if (!getProductCardRenderer(item2)) {
                        return null;
                      }
                      return (
                        <div className={styles.productCard} key={index + index2}>
                          {renderProductCard({ ...item2, index, index2, onActionClick })}
                        </div>
                      );
                    })
                  }
                </div>
                {!isLast && <div className={styles.productCardItemSeparator} />}
              </div>
            );
          })
        }
      </div>
    );
  }

  return null;
};

export default ImageSearchProductCardList;
