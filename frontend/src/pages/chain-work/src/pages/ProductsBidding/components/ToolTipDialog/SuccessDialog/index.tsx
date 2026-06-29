import React, { useState } from 'react';
import { Dialog, Button, Checkbox } from '@alifd/next';
import './index.scss';

const SuccessDialog = ({ visible, setVisible, onRedirect, operationType, callbackFn }) => {
  const [isReminderChecked, setIsReminderChecked] = useState(false);

  // 继续提报
  const handleStay = (operation) => {
    if (isReminderChecked) {
      localStorage.setItem(operation, JSON.stringify(isReminderChecked));
    }
    setVisible(false);
    callbackFn?.();
  };

  // 跳转
  const handleRedirect = (operation) => {
    onRedirect();
    if (isReminderChecked) {
      localStorage.setItem(operation, JSON.stringify(isReminderChecked));
    }
    setVisible(false);
  };

  // 关闭
  const handleCloseModal = () => {
    setVisible(false);
    callbackFn?.();
  };

  const getTitle = () => {
    return (
      <div className="successDialog-title">
        <img
          style={{ marginRight: 8 }}
          src="https://img.alicdn.com/imgextra/i3/O1CN01pvih4G1qq7XB8S5bG_!!6000000005546-55-tps-20-20.svg"
          alt="icon"
        />
        {operationType === 'submit' ? '商机提报成功！' : '修改提报成功！'}
      </div>
    );
  };

  const getFooterButtons = () => {
    if (operationType === 'submit') {
      return (
        <div className="successDialog-footer">
          <Button onClick={() => handleStay('submitChecked')} type="primary" className="successDialog-footer-button">
            继续提报
          </Button>
          <Button onClick={() => handleRedirect('submitChecked')}>查看我的提报</Button>
        </div>
      );
    }

    return (
      <div className="successDialog-footer">
        <Button onClick={() => handleRedirect('modifyChecked')} className="successDialog-footer-button" type="primary">
          提报其他商机
        </Button>
        <Button onClick={() => handleStay('modifyChecked')}>查看我的提报</Button>
      </div>
    );
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
        <div style={{ color: '#666' }}>您可以在“我的提报”页面中查看提报信息</div>
        <Checkbox
          checked={isReminderChecked}
          onChange={(v) => setIsReminderChecked(v)}
          label="下次不再提醒我"
          className="successDialog-content-checkbox"
        />
      </div>
    </Dialog>
  );
};

export default SuccessDialog;
