import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Dialog } from '@alifd/next';
import { signAgreement } from '../../services/action';

const TempSignAgreement = () => {
  const [visible, setVisible] = useState(true);

  const handleOk = () => {
    signAgreement(193792);
    setVisible(false);
  };

  return (
    <Dialog
      visible={visible}
      title="寄售模式通知"
      onOk={handleOk}
      closeIcon={null}
      footerActions={['ok']}
      footerAlign="center"
      closeMode={[]}
    >
      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>
        我已阅读并同意接受
        <a
          href="https://www.yuque.com/qe2gu6/sdy7ok/dt0xgo23lv2mstrb?spm=a21oa5.offsite_enrollpft.0.0.7aa51feaNx8uQN&singleDoc"
          target="_blank"
          rel="noreferrer"
        >
          《“速卖通”专享活动规则 V2.0》
        </a>，了解寄售模式规则
      </p>
    </Dialog>
  );
};

TempSignAgreement.open = () => {
  ReactDOM.render(<TempSignAgreement />, document.createElement('div'));
};

export default TempSignAgreement;
