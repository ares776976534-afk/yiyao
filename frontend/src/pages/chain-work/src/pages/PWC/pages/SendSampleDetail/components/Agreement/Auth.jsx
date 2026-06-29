import React, { useEffect } from 'react';
import { Dialog } from '@alifd/next';

export default ({ visible, onSuccess, onFail, authToken, onClose }) => {
  const handleSuccess = () => {
    onSuccess && onSuccess();
  };

  const handleMessage = (e) => {
    const { data } = e;
    if (
      data.success &&
      data.action === 'fin_unite_auth') {
      handleSuccess();
    } else {
      onFail && onFail(e);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage, false);
    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, []);

  return (
    <Dialog
      visible={visible}
      footer={false}
      onClose={onClose}
      title="官方物流协议签署"
    >
      <div>
        <iframe
          style={{
            border: 0,
            width: '600px',
            height: '250px',
          }}
          src={`https://jinrong.1688.com/page/AUTH/home?authKey=LOGISTICS_SETTLE_BUYER&taskToken=${authToken}`}
        />
      </div>
    </Dialog>
  );
};
