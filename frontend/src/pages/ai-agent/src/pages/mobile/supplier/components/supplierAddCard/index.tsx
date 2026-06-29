import styles from './index.module.scss';
import { WantWantIcon } from '@/components/Icon';
import { Checkbox } from 'antd-mobile';

interface SupplierAddCardProps {
  wangwangId: string;
  companyName: string;
  headImg: string;
  canAdd: boolean;
  checked?: boolean;
  onSelectChange?: (supplier: any, checked: boolean) => void;
}
export default function SupplierAddCard({
  wangwangId,
  companyName,
  headImg,
  canAdd,
  checked = false,
  onSelectChange,
  ...rest
} : SupplierAddCardProps) {
  const handleChange = (value: boolean) => {
    // 传递完整的供应商信息
    onSelectChange?.({ wangwangId, companyName, headImg, canAdd, ...rest }, value);
  };

  return (
    <div className={`${styles.supplierAddCard} ${checked ? styles.supplierAddCardChecked : ''}`} onClick={() => canAdd && handleChange(!checked)}>
      <img className={styles.supplierAddCardImage} src={headImg} alt="" srcSet="" />
      <div className={styles.supplierAddCardContent}>
        <div className={styles.supplierAddCardContentTitle}>{companyName}</div>
        <div className={styles.headerTitleWantWant}>
          <WantWantIcon className={styles.wantWantIcon} />
          <div className={styles.headerTitleWantWantText}>{wangwangId}</div>
        </div>
      </div>
      <div className={styles.supplierAddCardRight}>
        <Checkbox
          disabled={!canAdd}
          checked={checked}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}