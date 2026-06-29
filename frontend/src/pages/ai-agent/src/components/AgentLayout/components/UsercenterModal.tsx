import { Modal } from 'antd';
import UserCenter from './UserCenter';

import styles from './usercenterModal.module.css';
import { ForkIcon } from '@/components/Icon';

const UsercenterModal = ({ isModalOpen, handleCancel, selected }: { isModalOpen: boolean, handleCancel: () => void, selected: string }) => {
  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className={styles.usercenterModal}
      destroyOnHidden
      classNames={{
        content: styles.usercenterModalContent,
      }}
      closeIcon={<ForkIcon />}
    >
      <UserCenter selected={selected} />
    </Modal>
  );
};

export default UsercenterModal;