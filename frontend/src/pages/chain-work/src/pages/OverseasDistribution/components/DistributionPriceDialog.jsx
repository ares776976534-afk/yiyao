import React, { useState } from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';
import { comfirm } from '../services';
import Message from '@/components/UI/Message'

const container = document.createElement('div');

function DistributionPriceDialog({ props }) {
  const { handleActionClick, handleClose } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const onCancel = () => {
    onClose();
    handleClose && handleClose();
  };
  const onOk = () => {
    onClose();
    comfirm().then((res) => {
      const { bizSuccess, data, errorMsg } = res || {};
      if (bizSuccess) {
        if (data) {
          Message._show({
            content: '分销价格确认成功',
            type: 'success',
          });
          handleActionClick();
        }
      } else {
        Message._show({
          content: errorMsg || '系统异常',
          type: 'error',
        });
      }
    }).catch((err) => {
      Message._show({
        content: err.errorMessage,
        type: 'error',
      });
    });
  };
  const action = [
    { text: '同意', type: 'primary', onClick: onOk },
    { text: '不同意', type: 'default', onClick: onCancel },
  ];

  return (
    <Dialog
      ref={dialogRef}
      title={
        <div className="flex flex-row items-center text-[16px] leading-[19px] text-[#333] font-medium">
          <img src="https://img.alicdn.com/imgextra/i1/O1CN01Tn8wje1ov2d9pO62z_!!6000000005286-2-tps-16-16.png" alt="" srcSet="" />
          <span className="ml-[8px]">分销价格确认</span>
        </div>
      }
      onClose={onClose}
      visible={visible}
      footer={
        <div className="flex flex-row items-center justify-center gap-x-[12px]">
          {action.map((item) => (
            <Button
              key={item.text}
              type={item.type}
              onClick={item.onClick}
              style={{
                borderRadius: '6px',
                height: '32px',
              }}
            >
              {item.text}
            </Button>
          ))}
        </div>
      }
      footerAlign="center"
      style={{ width: '380px' }}
    >
      是否同意使用国内新分销价格，若同意将和国内保持同一套分销价格，若不同意或未设置过国内新分销价格将会默认使用原链批发价的一档价。
    </Dialog>
  );
}

DistributionPriceDialog.open = (props) => {
  ReactDOM.render(<DistributionPriceDialog props={props} />, container);
};

export default DistributionPriceDialog;
