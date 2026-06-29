import ProductDetailTable from '@/components/ChatFlow/ProductDetailTable';
import { Modal } from 'antd';
import styles from './hotDetailModal.module.css';
import { $t } from '@/i18n';

export const HotDetailModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) => {
  const { detailData, isProduct } = data;
  // 确保传递给 ProductDetailTable 的是数组格式
  const normalizedData = data ? (Array.isArray(detailData) ? detailData : [detailData]) : [];

  return (
    <Modal
      title={$t("global-1688-ai-app.select-product.RightComponents.HotDetailModal.viewDetails", "查看详情")}
      open={open}
      onCancel={onClose}
      footer={false}
      className={styles.hotDetailModal}
      style={{
        height: 'calc(100vh - 132px)',
        minWidth: 'calc(100vw - 48px)',
        top: '24px',
      }}
    >
      <ProductDetailTable
        data={normalizedData}
        isProduct={isProduct}
      />
    </Modal >
  );
};