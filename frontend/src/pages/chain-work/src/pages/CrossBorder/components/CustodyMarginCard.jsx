import React from 'react';
import DepositPaymentDialog from './DepositPaymentDialog';
import { exitChoiceBond } from '@/pages/Select/services';
import Message from '@/components/UI/Message';
import { Dialog, Button } from '@alifd/next';

function CustodyMarginCard({ data, handleActionClick, queryChoiceBusinessBacklog }) {
  const action = (type) => {
    switch (type) {
      case 'KJ_BOND_PAY':
        DepositPaymentDialog.open({ data, handleActionClick });
        break;
      default:
        break;
    }
  };
  const onExit = () => {
    const dialog = Dialog.show({
      v2: true,
      title: '退出保证金',
      content: (
        <div style={{ width: 360 }}>
          您正在进行退出保证金操作，退出后可自主决定是否重新缴纳保证金
        </div>
      ),
      onClose: false,
      closeIcon: (<div className="cursor-auto w-[20px] h-[20px]" />),
      footerAlign: 'center',
      className: 'deposit-payment-dialog',
      footer: (
        <div style={{ width: '100%' }}>
          <Button
            type="primary"
            onClick={() => {
              exitChoiceBond().then((res) => {
                const { success, msg = '数据异常', model = {} } = res;
                if (success) {
                  if (model?.isExitSuccess) {
                    dialog.hide();
                    handleActionClick();
                    queryChoiceBusinessBacklog();
                    Message._show({ content: '退出跨境托管保证金成功', type: 'success' });
                  } else {
                    dialog.hide();
                    Message._show({ content: model?.message || '退出跨境托管保证金失败', type: 'error' });
                  }
                } else {
                  Message._show({ content: msg, type: 'error' });
                }
              }).catch((err) => {
                Message._show({ content: err?.message || '数据异常', type: 'error' });
              });
            }}
            style={{ borderRadius: '6px', marginRight: '12px' }}
          >
            确定退出
          </Button>
          <Button onClick={() => { dialog.hide(); }} style={{ borderRadius: '6px' }}> 取消</Button>
        </div>
      ),
    });
  };
  return (
    <div className="h-[100px] rounded-[6px] p-[16px] flex flex-col gap-y-[8px]" style={{ background: 'linear-gradient(181deg, rgba(255, 249, 235, 0.8) -11%, rgba(255, 249, 235, 0) 45%), #FFFFFF' }}>
      <div className="h-[19px] flex items-center justify-between">
        <div>
          <span className="text-[#333] text-[16px] font-medium">托管保证金</span>
          {data?.canExit && <span className="text-[#999] text-[14px] ml-[8px] cursor-pointer" onClick={onExit}>退出</span>}
        </div>
        {data?.isExit ? <span className="text-[#999] text-[14px]">已退出</span> : (
          <div className="text-[#000] text-[14px]">
            余额：
            <span className="text-[#FF8B00]">{data?.bondAmount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustodyMarginCard;
