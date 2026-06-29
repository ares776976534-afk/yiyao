import { Modal } from 'antd';
// import CommonTable from '@/components/ChatFlow/CommonTable';
// import { querySameStyleProducts } from './services';
// import { useEffect, useState } from 'react';
// import { Tooltip } from 'antd';
// import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './index.module.css';
// import FrostedGlass from '../FrostedGlass';
// import { $t } from '@/i18n';

const ApiModal = ({
  open,
  onClose,
  renderSlot,
  onScroll,
}: {
  open: boolean;
  onClose: () => void;
  renderSlot: () => React.ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}) => {
  return (
    <Modal
      title="查看详情"
      open={open}
      onCancel={onClose}
      footer={false}
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      className={styles.apiModalContentContainer}
    >
      <div
        style={{
          height: 'calc(100vh - 200px)',
          overflow: 'auto',
        }}
        onScroll={onScroll}
      >
        {renderSlot()}
      </div>
    </Modal>
  );
};

export default ApiModal;