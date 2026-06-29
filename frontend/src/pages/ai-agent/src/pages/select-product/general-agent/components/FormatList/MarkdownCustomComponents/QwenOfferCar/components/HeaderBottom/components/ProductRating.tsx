import styles from './productRating.module.css';

const ProductRating = (props) => {
  const { reviewLabel } = props;
  const list = [
    {
      title: '好评标签',
      type: 'succse',
      bg: '#21A84A',
      arr: reviewLabel.filter((item) => item.sentiment === "POSITIVE")
    },
    {
      title: '差评标签',
      type: 'error',
      bg: '#F55353',
      arr: reviewLabel.filter((item) => item.sentiment === "NEGATIVE")
    },
  ]
  return (
    <div className={styles.ProductRating}>
      {list?.map((ele) => (
        <div className={styles.ProductRatingItem} key={ele.type}>
          <div className={styles.ProductRatingItemHeader}>
            <div className={styles.ProductRatingItemIcon} style={{ backgroundColor: ele?.bg }} />
            <div className={styles.ProductRatingItemTitle}>{ele.title}</div>
          </div>
          <div className={styles.ProductRatingContent}>
            {ele?.arr?.length > 0 ? ele?.arr?.map((item) => {
              return (
                <div className={styles.tabItem}>
                  <div className={styles.tabItemTitle}>{item.labelName}</div>
                  <div className={styles.tabItemValue}>{item.percent}</div>
                </div>
              )
            }) : (
              <div className={styles.tabItem}>
                <div className={styles.emptyText}>暂无好评</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductRating;
