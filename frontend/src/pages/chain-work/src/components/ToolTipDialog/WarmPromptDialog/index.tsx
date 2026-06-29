import React from 'react';
import { Dialog, Button } from '@alifd/next';

function WarmPromptDialog({ visible, setVisible }) {
  const getTitle = () => {
    return (
      <div className="successDialog-title">
        <img
          style={{ marginRight: 8 }}
          src="https://img.alicdn.com/imgextra/i4/O1CN01iqqGSl1wOXNSy9FV6_!!6000000006298-55-tps-16-16.svg"
          alt="icon"
        />
        商机提报成功
      </div>
    );
  };

  const getFooterButtons = () => {
    return (
      <div className="successDialog-footer">
        <Button onClick={() => handleCloseModal()} type="primary" className="successDialog-footer-button">
          确认撤回
        </Button>
        <Button onClick={() => handleCloseModal()}>取消</Button>
      </div>
    );
  };

  // 关闭
  const handleCloseModal = () => {
    setVisible(false);
  };
  return (
    <Dialog
      visible={visible}
      onClose={handleCloseModal}
      title={getTitle()}
      footer={getFooterButtons()}
      className="successDialog"
    >
      <div className="successDialog-content">
        <div style={{ color: '#666' }}>撤回后将以修改前的信息继续供货</div>
      </div>
    </Dialog>
  );
}

export default WarmPromptDialog;
