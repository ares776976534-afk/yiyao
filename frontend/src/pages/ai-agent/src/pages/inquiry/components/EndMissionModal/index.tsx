import React, { useState } from 'react';
import { Modal } from 'antd';
import styles from './index.module.css';
import { MainBtn, AssistanceBtn } from '@/components/ChatFlow/Btn';

interface EndMissionModalProps {
  open: boolean;
  onClose: () => void;
  handleOk: () => void;
}
const EndMissionModal: React.FC<EndMissionModalProps> = ({ open, onClose, handleOk }) => {
  const handleCancel = () => {
    onClose();
  };
  return (
    <Modal
      open={open}
      footer={null}
      className={styles.endMissionModal}
      closeIcon={false}
      width={379}
      centered
    >
      <div className={styles.endMissionModalContent}>
        <div className={styles.endMissionModalContentTitle}>
          <div className={styles.endMissionModalContentTitleText}>确定要终止本次任务吗？</div>
          <div className={styles.endMissionModalContentTitleTextDesc}>终止后，任务将无法继续进行，请确认。</div>
        </div>
        <div className={styles.endMissionModalContentButtons}>
          <AssistanceBtn text="取消" handleBtn={handleCancel} />
          <div className={styles.stopBtn}>
            <MainBtn text="终止任务" handleBtn={handleOk} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EndMissionModal;