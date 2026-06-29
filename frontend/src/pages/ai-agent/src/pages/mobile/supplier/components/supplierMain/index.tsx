import styles from './index.module.scss';
import { MainBtn, SecondaryBtn } from '@/components/ChatFlow/Btn';
import { SyncOutlined, PlusOutlined } from '@ant-design/icons';
import { agentImg } from '@/pages/mobile/config/agentImg';

interface SupplierMainProps {
  isSyncing: boolean;
  canStatusText: string;
  onSync1688Collect: () => void;
  onAddSupplier: () => void;
}
export const SupplierMain = ({
  isSyncing,
  canStatusText,
  onSync1688Collect,
  onAddSupplier,
}: SupplierMainProps) => {
  return (
    <div className={styles.supplierMain}>
      <div className={styles.supplierMainHeader}>
        <img className={styles.supplierMainHeaderImage} src={agentImg.empty} alt="" srcSet="" />
        <div className={styles.supplierMainHeaderTitle}>导入1688卖家，更好地管理你的供应商库</div>
      </div>
      <div className={styles.supplierMainBtn}>
        <MainBtn
          icon={<SyncOutlined spin={isSyncing} />}
          text={canStatusText}
          handleBtn={onSync1688Collect}
        />
        <SecondaryBtn
          icon={<PlusOutlined />}
          text='手动添加供应商'
          handleBtn={onAddSupplier}
        />
      </div>
    </div>
  );
};