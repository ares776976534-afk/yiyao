import styles from './infoCard.module.scss';
import { Tooltip } from 'antd';
import { imgIcon } from '@/components/ChatFlow/imgIcon';

const InfoCard = ({
  title,
  list
}) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoTitle}>{title}</div>
      {list.map((item) => (
        <div className={styles.infoItem} key={item.key}>
          <div className={styles.infoItemLable}>
            <div className={styles.infoItemText}>{item?.lable}</div>
            {item?.tip && (
              <Tooltip title={item.tip} placement="top">
                <img style={{ width: 14, height: 14, cursor: 'pointer' }} src={imgIcon[13]} alt="" />
              </Tooltip>
            )}
          </div>
          <div className={styles.infoItemValue}>{item?.value}</div>
        </div>
      ))}
    </div>
  )
}

export default InfoCard;