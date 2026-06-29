import styles from "./index.module.scss";

export default (props: {
  data: any;
  dataIndex: number;
  onClick?: (item: any) => void;
}) => {
  const { data, onClick } = props;
  const firstImage = data?.showCoverImages?.[0];

  return (
    firstImage && (
      <div
        className={styles.showCaseItem}
        data-role="show-case-item"
        onClick={onClick}
      >
        <img
          className={styles.showCaseItemImage}
          src={firstImage.sourceUrl}
          alt=""
        />
        <div className={styles.showCaseItemInfoTitle}>{data.showTitle}</div>
      </div>
    )
  );
};
