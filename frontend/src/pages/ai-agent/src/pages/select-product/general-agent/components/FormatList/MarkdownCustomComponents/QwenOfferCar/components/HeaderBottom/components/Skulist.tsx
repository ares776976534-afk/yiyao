import styles from './skuList.module.css';
import { ChevronUpIcon } from '@/components/Icons';

import { Spin } from 'antd';

const SkuList = (props) => {
  const { currentPage, loading, pageSize, totalPages, loadData, dataSource } = props;

  const handleLeftClick = () => {
    if (currentPage > 1 && !loading) {
      loadData(currentPage - 1, pageSize);
    }
  };

  const handleRightClick = () => {
    if (currentPage < totalPages && !loading) {
      loadData(currentPage + 1, pageSize);
    }
  };

  return (
    <div className={styles.skuList}>
      <div className={styles.skuContent}>
        <Spin spinning={loading}>
          {dataSource?.map((item, index) => (
            <div className={styles.skuItem} key={index} >
              <div className={styles.skuItemImg} onClick={() => window.open(item?.productUrl, '_blank')}>
                <img className={styles.skuItemImage} src={item?.imageUrl} alt="" />
              </div>
              <div className={styles.skuItemRight}>
                <div className={styles.skuRightItem}>
                  <div className={styles.skuItemLabel}>SKU价格：</div>
                  <div className={styles.skuItemValue}>{item?.sold30dAmt}</div>
                </div>
                <div className={styles.skuRightItem}>
                  <div className={styles.skuItemLabel}>ID：</div>
                  <div className={styles.skuItemValue}>{item?.skuId}</div>
                </div>
              </div>
            </div>
          ))}
        </Spin>
      </div>
      {/* <div className={styles.loadMoreWrapper}>
        <div
          className={`${styles.loadMoreIcon} ${styles.LeftIcon} ${currentPage === 1 || loading ? styles.disabled : ''}`}
          onClick={handleLeftClick}
        >
          <ChevronUpIcon size={12} />
        </div>
        <div className={styles.loadMoreText}>{currentPage}/{totalPages}</div>
        <div
          className={`${styles.loadMoreIcon} ${styles.RightIcon} ${currentPage === totalPages || loading ? styles.disabled : ''}`}
          onClick={handleRightClick}
        >
          <ChevronUpIcon size={12} />
        </div>
      </div> */}
    </div>
  );
};

export default SkuList;