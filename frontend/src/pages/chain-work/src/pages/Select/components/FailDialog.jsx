import React, { useState } from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';
import MarginConfirmationDialog from './MarginConfirmationDialog';

const container = document.createElement('div');

function FailDialog({ props }) {
  const { model, data, handleActionClick, closeActionClick } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    if (!data?.popUpActionList?.some((item) => item.actionCode === 'KJ_BOND_TEM_NOT_PAY')) {
      MarginConfirmationDialog.open({ data, handleActionClick, closeActionClick });
    }
  };
  const action = () => {
    switch (model?.action?.actionCode) {
      case 'KJ_BOND_PAY_JUMP':
        window.open('https://work.1688.com/?spm=a2638g.u_0_1001.0.du_3_1010.4e721768B9AC53&_path_=sellerPro/lvyue/protectionService', '_blank');
        break;
      case 'KJ_BOND_PAY_CONFIRM':
        onClose();
        break;
      default:
        break;
    }
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="保证金缴纳"
      visible={visible}
      onClose={onClose}
      footer={
        <div>
          <Button
            type="primary"
            style={{ borderRadius: '6px', marginRight: '12px' }}
            onClick={action}
          >
            {model?.action?.actionDesc}
          </Button>
        </div>
    }
      footerAlign="center"
      className="deposit-payment-dialog"
      width={'500px'}
    >
      <div className="text-[#333] text-[14px]">
        {model?.message}
      </div>
    </Dialog>
  );
}

FailDialog.open = (props) => {
  ReactDOM.render(<FailDialog props={props} />, container);
};

export default FailDialog;
