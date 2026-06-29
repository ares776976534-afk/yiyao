import styles from './index.module.scss';
import { WantWantIcon, AddressIcon, SuperFactoryIcon, CattleIcon } from '@/components/Icon';

const tagIcon = {
  pmplus: <SuperFactoryIcon />, // 超级工厂
  sourceProvider: null, // 源头工厂
  pm: <CattleIcon />, // 实力商家
  tp: null, // 诚信通 5 年
};
interface SupplierMainCardProps {
  tag: any[];
  location: string;
  wangwangId: string;
  companyName: string;
  primaryCategory: string;
  serviceInfo: any[];
  source: string;
  headImg: string;
}
export default function SupplierMainCard({
  tag,
  location,
  wangwangId,
  companyName,
  primaryCategory,
  serviceInfo,
  source,
  headImg,
} : SupplierMainCardProps) {

  return (
    <div className={styles.supplierMainCard}>
      <img className={styles.supplierMainCardImage} src={headImg} alt="" srcSet="" />
      <div className={styles.supplierMainCardTag}>{source}</div>
      <div className={styles.supplierMainCardContent}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.headerTitleText}>{companyName}</div>
            <div className={styles.headerTitleWantWant}>
              <WantWantIcon className={styles.wantWantIcon} />
              <div className={styles.headerTitleWantWantText}>{wangwangId}</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            {tag?.length > 0 && (
              <>
                <div className={styles.merchantTag}>
                  {tag?.map((ele: any, tagIndex: number) => (
                    <div key={`provider-tag-${tagIndex}-${ele.code}`} className={`${styles.merchantTagItem} ${styles[ele.code]}`}>
                      {tagIcon[ele.code]}
                      {ele.value}
                    </div>
                  ))}
                </div>
                <div className={styles.divider} />
              </>
            )}
            <div className={styles.address}>
              <AddressIcon className={styles.addressIcon} />
              <span className={styles.addressName}>{location}</span>
            </div>
          </div>
        </div>
        <div className={styles.primaryCategory}>主营：{primaryCategory}</div>
        <div className={styles.serviceInfo}>
          {serviceInfo && serviceInfo?.length && serviceInfo?.map((ele: any, serviceIndex: number) => (
            <div key={ele.k} className={styles.info}>
              <div className={styles.serviceInfoItem}>
                <div className={styles.serviceInfoKey}>{ele.k}</div>
                <div className={styles.serviceInfoValue}>{ele.v}</div>
              </div>
              {serviceInfo.length > serviceIndex + 1 && <div className={styles.divider} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}