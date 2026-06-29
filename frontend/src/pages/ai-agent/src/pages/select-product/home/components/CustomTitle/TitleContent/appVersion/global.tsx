import styles from './global.module.css';

const Global = (props: { title?: string }) => {
  return (
    <div className={styles.header}>
      <img className={styles.headerLogo} src="https://img.alicdn.com/imgextra/i4/O1CN01WWPiMg1IT2nadnfJX_!!6000000000893-2-tps-527-72.png" alt="logo" />
      {
        !!props.title && (
          <div className={styles.headerText}>
            {props.title}
          </div>
        )
      }
    </div>
  );
};

export default Global;