import { useState } from 'react';
import styles from './index.module.css';
import { imgIcon } from '../imgIcon';
import { SameNumModal } from '../SameNumModal';

export default function SimilarCount({ count, record }: { count: number, record: any }) {
    const [open, setOpen] = useState(false);
    const [recordData, setRecordData] = useState({});
    const onClose = () => {
      setOpen(false);
    };
  if (record?.isCategory || record?.isTopProducts || record?.isLoading) {
    return null;
  }
  const onDetailClick = () => {
    setOpen(true);
    setRecordData({
      spId: record?.spId || record?.spInfo?.spId, // 同款簇ID
      region: record?.region,     // 地区二字码
      platform: record?.platform, // 平台
    });
  };
  return (
    <>
      <SameNumModal open={open} onClose={onClose} data={recordData} />
      <div className={styles.similarCount}>
        <span>{count}</span>
        <div className={styles.imgCardTitleImg}>
          <img className={styles.imgCardTitleImgImg} src={imgIcon[5]} alt="img" onClick={onDetailClick} />
        </div>
      </div>
    </>
    
  );
}