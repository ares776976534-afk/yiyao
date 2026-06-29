import React, { useState } from 'react';
import { Dialog, Button, Checkbox } from '@alifd/next';
import ReactDOM from 'react-dom';
import fatigue from '@alife/1688-chain-fatigue';
import { signUp } from '../services';
import Message from '@/components/UI/Message';

const container = document.createElement('div');

function ListingReminder({ props }) {
  const { fn, offerIds, onDialog } = props;
  const [visible, setVisible] = useState(true);
  const [checked, setChecked] = useState(false);
  const dialogRef = React.createRef();
  const handleToggle = () => {
    fatigue.set('Listing-supply-balloon-fatigue', {
      rule: '9 * * * * * 1', // 年 月 日 时 分 秒 周 重复次数
    }, { mtop: false });
  };
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    onDialog();
  };
  const onOk = () => {
    if (checked) {
      handleToggle();
    }
    signUp(JSON.stringify({ offerIds, signUpSource: 'SELF_APPLY' })).then((r) => {
      if (r?.success) {
        onClose();
        Message._show({ content: '申请成功', type: 'success' });
        fn();
      } else {
        Message._show({ content: r?.msg || '请求失败' || r?.errorInfo, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '请求失败', type: 'error' });
    });
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="上架提醒"
      onClose={onClose}
      visible={visible}
      style={{ width: 400, borderRadius: 6 }}
      footer={
        <div>
          <div className="text-left">
            <Checkbox
              onChange={(c) => {
                setChecked(c);
              }}
            >
              不再提示
            </Checkbox>
          </div>
          <div className="flex justify-center gap-[12px]">
            <Button type="primary" onClick={onOk} >确认</Button>
            <Button type="normal" onClick={onClose} >取消</Button>
          </div>
        </div>
      }
    >
      申请上架后，如果商品被速卖通选中上架，需保障商品在活动期间持续在架。
    </Dialog>
  );
}

ListingReminder.open = (props) => {
  ReactDOM.render(<ListingReminder props={props} />, container);
};

export default ListingReminder;
