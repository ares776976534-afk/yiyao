import styles from './empty.module.scss';

const Empty = () => {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyContent}>
        <img className={styles.emptyImage} src="https://img.alicdn.com/imgextra/i2/O1CN01D0Rdxr24gPvhJS0Yf_!!6000000007420-2-tps-256-256.png" alt="" />
        <div className={styles.emptyText}>
          <div>暂无符合筛选条件的商品</div>
          <div>请重新设置筛选项</div>
        </div>
      </div>
    </div>
  );
};

export default Empty;