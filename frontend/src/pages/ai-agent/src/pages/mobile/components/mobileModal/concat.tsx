import styles from './concat.module.scss';

const list = [
  {
    title: '加入企业微信群',
    url: 'https://img.alicdn.com/imgextra/i1/O1CN016lXflH21QteI2d3nG_!!6000000006980-2-tps-236-236.png'
  },
  {
    title: '关注微信公众号',
    url: 'https://img.alicdn.com/imgextra/i4/O1CN01K6eFHf25ViHFGDXiq_!!6000000007532-2-tps-236-236.png'
  }
]
const Concat = () => {
  return (
    <div className={styles.container}>
      {list.map((item) => (
        <div className={styles.concatItem} key={item.title}>
          <div className={styles.concatItemIcon}>
            <img className={styles.concatItemIconImg} src={item.url} alt={item.title} />
          </div>
          <div className={styles.concatItemTitle}>{item.title}</div>
        </div>
      ))}
    </div>
  );
};

export default Concat;