import React from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';

const container = document.createElement('div');
function SupplyChainDialog({ props }) {
  const onOk = () => {
    props.onOK();
    onClose();
  };
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
  };
  return (
    <Dialog
      v2
      title="工厂供应链信息"
      onClose={onClose}
      visible
      footer={
        <Button type="primary" onClick={onOk} style={{ borderRadius: '6px' }} >
          立即填写
        </Button>
      }
      footerAlign="center"
      style={{ width: '640px' }}
    >
      <div className="text-[#333] text-[14px]">
        <div className="font-medium">维护工厂供应链能力信息，您将有机会成为1688供应链供货商家，获得以下权益：</div>
        <div>
          <div>1）直通站内外核心流量资源</div>
          <div>*包括但不限于：1688站内搜索、1688营销场景、支付宝、达人直播、站外200家isv、跨境超买、跨境服务商等）</div>
          <div>2）官方素材中心免费拍摄短视频和图片，一站式营销</div>
          <div>3）1688官方接单智能派单生产</div>
        </div>
      </div>
    </Dialog>
  );
}

SupplyChainDialog.open = (props) => {
  ReactDOM.render(<SupplyChainDialog props={props} />, container);
};

export default SupplyChainDialog;
