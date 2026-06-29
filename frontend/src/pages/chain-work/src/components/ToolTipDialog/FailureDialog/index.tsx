import React from 'react';
import { Dialog, Button } from '@alifd/next';
import './index.scss';

const FailureDialog = ({ visible, setVisible, failureReason, operationType }) => {
  const handleCloseModal = () => {
    setVisible(false);
  };

  return (
    <Dialog
      visible={visible}
      onClose={handleCloseModal}
      title={
        <div className="failureDialog-title">
          <img
            src="https://img.alicdn.com/imgextra/i4/O1CN01FcNq3e1LaJmPaozcU_!!6000000001315-55-tps-20-20.svg"
            alt="icon"
            style={{ marginRight: 8 }}
          />
          <div>{operationType === 'submit' ? '商机提报失败！' : '修改提报失败！'}</div>
        </div>
      }
      footer={
        <div className="failureDialog-footer">
          <Button onClick={handleCloseModal} type="primary">
            我知道了
          </Button>
        </div>
      }
      className="failureDialog"
    >
      <div className="failureDialog-content">{failureReason}</div>
    </Dialog>
  );
};

export default FailureDialog;
