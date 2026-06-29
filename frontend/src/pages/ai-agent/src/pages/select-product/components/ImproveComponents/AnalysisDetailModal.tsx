import { Markdown } from '@/components/ChatFlow/Markdown';
import { Modal } from 'antd';
import { $t } from '@/i18n';
import style from './reviewDetailModal.module.css';

export const AnalysisDetailModal = ({ open, onClose, data }: { open: boolean; onClose: () => void; data: any }) => {
  return (
    <Modal
      title={$t("global-1688-ai-app.select-product.ImproveComponents.AnalysisDetailModal.viewDetails", "查看详情")}
      open={open}
      onCancel={onClose}
      footer={false}
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      className={style.reviewDetailModalContentContainer}
    >
      <Markdown
        text={data?.improvementSuggestionSummary}
        chunkIntervalMs={50}
        streamGranularity="char"
      />
    </Modal>
  );
};