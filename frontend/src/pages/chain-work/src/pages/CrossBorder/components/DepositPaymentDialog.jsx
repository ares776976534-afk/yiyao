import React, { useState } from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';
import MarginConfirmationDialog from './MarginConfirmationDialog';

const container = document.createElement('div');

const typeMap = {
  KJ_BOND_PAY: 'primary',
  KJ_BOND_PAY_JUMP: 'primary',
  KJ_BOND_TEM_NOT_PAY: 'normal',
};
function DepositPaymentDialog({ props }) {
  const { data, handleActionClick, closeActionClick = () => { } } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const list = data?.popUpActionList;
  // const hasNotPay = list?.some(item => item.actionCode === 'KJ_BOND_TEM_NOT_PAY');
  // // 如果不存在，则添加新项
  // if (!hasNotPay) {
  //   list.push({
  //     actionCode: 'KJ_BOND_TEM_NOT_PAY',
  //     actionDesc: '暂不缴纳',
  //   });
  // }
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    closeActionClick();
  };
  const action = (type) => {
    switch (type) {
      case 'KJ_BOND_PAY':
        onClose();
        MarginConfirmationDialog.open({ data, handleActionClick, closeActionClick });
        break;
      case 'KJ_BOND_PAY_JUMP':
        window.open('https://work.1688.com/?spm=a2638g.u_0_1001.0.du_3_1010.4e721768B9AC53&_path_=sellerPro/lvyue/protectionService', '_blank');
        break;
      case 'KJ_BOND_TEM_NOT_PAY':
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
      onClose={false}
      visible={visible}
      footer={
        <div>
          {list?.map((item, index) => {
            return (
              <Button
                type={typeMap[item?.actionCode]}
                onClick={() => action(item?.actionCode)}
                style={{ borderRadius: '6px', marginRight: data?.popUpActionList?.length - 1 === index ? 0 : '12px' }}
              >
                {item?.actionDesc}
              </Button>
            );
          })}
        </div>
      }
      closeIcon={<div className="cursor-auto w-[20px] h-[20px]" />}
      footerAlign="center"
      className="deposit-payment-dialog"
      width={'500px'}
    >
      <div className="text-[#333] text-[14px]">
        <div dangerouslySetInnerHTML={{ __html: data?.popUpText }} />
      </div>
    </Dialog>
  );
}

DepositPaymentDialog.open = (props) => {
  ReactDOM.render(<DepositPaymentDialog props={props} />, container);
};

export default DepositPaymentDialog;
