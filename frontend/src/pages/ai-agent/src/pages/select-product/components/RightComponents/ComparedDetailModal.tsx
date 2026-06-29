import { Modal } from 'antd';
import ComparedDetailTable from '@/components/ChatFlow/ComparedDetailTable';
import { Markdown } from '@/components/ChatFlow/Markdown';
import styles from './comparedDetailModal.module.css';
import { $t } from '@/i18n';

export const ComparedDetailModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) => {
  const { status = '', summary = '', detailData, isProduct
  } = data;
  const normalizedData = detailData ? (Array.isArray(detailData) ? detailData : [detailData]) : [];
  return (
    <Modal
      title={$t("global-1688-ai-app.select-product.RightComponents.ComparedDetailModal.viewDetails", "查看详情")}
      open={open}
      onCancel={onClose}
      footer={false}
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      className={styles.migratedDetailModalContentContainer}
    >
      <div className="flex">
        <div className={styles.comparedDetailTable}>
          <ComparedDetailTable
            data={normalizedData}
            isProduct={isProduct}
          />
        </div>
        <div
          className="w-[400px] ml-4 rounded-[8px] bg-white border border-[#F3F3F6] p-4 overflow-y-auto"
          style={{
            height: 'calc(100vh - 132px)',
          }}
        >
          {status === 'COMPARED' ? (
            <div>
              <p>{$t("global-1688-ai-app.select-product.RightComponents.ComparedDetailModal.yzrt", "以下是为你总结的对比结果：")}</p>
              <Markdown
                text={summary}
                chunkIntervalMs={50}
                streamGranularity="char"
              />
            </div>
          ) : (
            <p>{$t("global-1688-ai-app.select-product.RightComponents.ComparedDetailModal.zzbjzqnxdd", "正在比较中，请耐心等待...")}</p>
          )}
        </div>
      </div>
    </Modal >
  );
};