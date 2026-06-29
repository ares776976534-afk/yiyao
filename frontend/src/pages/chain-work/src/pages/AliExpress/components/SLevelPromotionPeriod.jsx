import React, { useState } from 'react';
import { Dialog, Button, Checkbox } from '@alifd/next';
import ReactDOM from 'react-dom';
import { operatePopWindow } from '@/pages/AliExpress/services';
import Message from '@/components/UI/Message';

const container = document.createElement('div');

function SLevelPromotionPeriod({ onClose: onCloseCallback } = {}) {
  const [visible, setVisible] = useState(true);
  const [checked, setChecked] = useState(false);
  const dialogRef = React.createRef();
  const common = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    onCloseCallback?.();
  };
  const dialogOperate = (action) => {
    operatePopWindow({
      operateType: 'close',
      isNeverPop: checked,
      action,
    }).then((res) => {
      const { success = false, msg = '数据加载失败', model = false } = res;
      if (success && model) {
        common();
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.message, type: 'error' });
    });
  };
  const onClose = () => {
    dialogOperate('CANCEL');
  };
  const onOk = () => {
    dialogOperate('CONFIRM');
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="尊敬的商家"
      onClose={onClose}
      visible={visible}
      style={{ width: 600, borderRadius: 6 }}
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
      <div>
        <div>6月将进入速卖通平台的S级大促期，为保障您的商品在大促期间可获得速卖通平台的大促流量扶持，您的商品需在活动期间（06.01-06.25）保持持续在架，并在接单后按照履约时效要求及时履约。如您确认可保障商品的持续在架和履约，速卖通平台将在大促期间优先推广您的商品。如您有商品希望在速卖通平台上架的，可在下方“商品-不在售商品列表”中进行提报。</div>
        <div>感谢您的支持！</div>
      </div>
    </Dialog>
  );
}

SLevelPromotionPeriod.open = (props) => {
  ReactDOM.render(<SLevelPromotionPeriod {...props} />, container);
};

export default SLevelPromotionPeriod;
