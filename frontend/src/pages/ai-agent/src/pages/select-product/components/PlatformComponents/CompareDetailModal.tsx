import { Modal } from 'antd';
import { CompareInfo } from './CompareInfo';
import { $t } from '@/i18n';
import styles from './migratedDetailModal.module.css';

export const CompareDetailModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) => {
  return (
    <Modal
      title={$t("global-1688-ai-app.select-product.PlatformComponents.CompareDetailModal.viewDetails", "查看详情")}
      open={open}
      onCancel={onClose}
      footer={false}
      style={{
        height: 'calc(100vh - 132px)',
        minWidth: 'calc(100vw - 48px)',
        top: '24px',
      }}
      className={styles.migratedDetailModalContentContainer}
    >
      <CompareInfo
        data={data}
      />
    </Modal>
  );
};