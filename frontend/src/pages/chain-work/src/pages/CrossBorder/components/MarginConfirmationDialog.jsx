import React, { useState } from 'react';
import { Dialog, Button, Checkbox } from '@alifd/next';
import ReactDOM from 'react-dom';
import { joinChoiceBond } from '@/pages/Select/services';
import Message from '@/components/UI/Message';
import FailDialog from './FailDialog';
import DepositPaymentDialog from './DepositPaymentDialog';

const container = document.createElement('div');

function MarginConfirmationDialog({ props }) {
  const { data, handleActionClick, closeActionClick = () => { } } = props;
  const [visible, setVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    if (!data?.popUpActionList?.some((item) => item.actionCode === 'KJ_BOND_TEM_NOT_PAY')) {
      DepositPaymentDialog.open({ data, handleActionClick, closeActionClick });
    }
  };
  const onOk = () => {
    handleActionClick();
  };
  const onChange = (v) => {
    setIsChecked(v);
  };
  const getJoinChoiceBond = () => {
    joinChoiceBond().then((res) => {
      if (res?.success) {
        if (res?.model?.isJoinSuccess) {
          Message._show({ content: '加入跨境托管保证金成功', type: 'success' });
          onOk();
          onClose();
        } else {
          onClose();
          FailDialog.open({ model: res?.model, data, handleActionClick, closeActionClick });
        }
      } else {
        onClose();
        Message._show({ content: res?.msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      onClose();
      Message._show({ content: err?.message || '数据异常', type: 'error' });
    });
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<span className="text-[16px] font-medium text-[#333]">保证金缴纳确认</span>}
      onClose={onClose}
      visible={visible}
      footer={
        <Button
          type="primary"
          onClick={getJoinChoiceBond}
          disabled={!isChecked}
          style={{ borderRadius: '6px', marginRight: '12px' }}
        >
          确认缴纳
        </Button>
      }
      footerAlign="center"
      className="deposit-payment-dialog"
      width={'600px'}
    >
      <div className="w-[560px]">
        {/* <div className="text-[#333] text-[14px]">
          <div>尊敬的商家，为了提升买家采购体验及采购规模，跨境choice托管即日起将收取商家保证金，具体规则如下：</div>
          <div className="flex"><div>1、</div><div>金额标准：托管保证金为5000元人民币或者购买150元履约险</div></div>
          <div className="flex"><div>2、</div><div>用途说明：用于约束合规经营，若存在延迟发货、品质问题、虚假销售等违规行为，将按规则扣罚</div></div>
          <div className="flex"><div>3、</div><div>退换机制：商家退出跨境托管合作且无违规记录时，保证金可全额退还</div></div>
        </div>
        <div className="flex mt-[10px] text-[#333] text-[14px]">
          <Checkbox checked={isChecked} onChange={onChange} />
          <span className="ml-[8px]">请确保账户余额充足，并严格遵守托管经营管理规则，关于保证金缴纳、管理、使用、退回等规则，请见
            <a href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250422115959302/20250422115959302.html" target="_blank" rel="noreferrer" >《1688数字供应链托管合作保证金规范》</a>
            。
          </span>
        </div> */}
        <div className="text-[#333] text-[14px] mt-[10px]">
          确认后将完成保证金的充值和缴纳
        </div>
      </div>
    </Dialog>
  );
}

MarginConfirmationDialog.open = (props) => {
  ReactDOM.render(<MarginConfirmationDialog props={props} />, container);
};

export default MarginConfirmationDialog;
