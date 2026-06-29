// import { Image } from 'antd';
// import studioDefaults from "@/configs/studioDefaults";
import View from "@alife/channel-fe-materials-react-appear";
import styles from './index.module.scss';

export default (props: { data: any, dataIndex: number, onClick?: (item: any) => void, onFirstAppear?: () => void }) => {
  const { data, onClick, onFirstAppear } = props;
  const len = data?.showCoverImages?.length;

  return len > 0 && (
    <View
      className={`${styles.showCaseItem} ${styles[`showCaseItem-${len}`]}`}
      data-role="show-case-item"
      onClick={onClick}
      onFirstAppear={onFirstAppear}
    >
      <div className={styles.showCaseItemImageListWrapper} data-role="showCaseItemImageListWrapper">
        <div className={styles.showCaseItemImageList} data-role="show-case-item-image-list">
          {
            data?.showCoverImages?.slice(0, 4)?.map((item, i) => {
              return (
                <div key={`case_image_${i}`} className={styles.showCaseItemImageWrapper}>
                  <img className={styles.showCaseItemImage} src={item.sourceUrl} alt="" />
                </div>
              );
            })
          }
        </div>
      </div>
      <div className={styles.showCaseItemInfo}>
        <div className={styles.showCaseItemInfoTitle}>{data.showTitle}</div>
        {/* <div className={styles.showCaseItemInfoUserNameWrapper}>
          <Image className={styles.showCaseItemUserImage} src={data.userImage} fallback={studioDefaults.userImage} preview={false} />
          <div>{data.userName}</div>
        </div> */}
      </div>
    </View>
  );
};