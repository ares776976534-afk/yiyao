import React from 'react';
import { Dialog } from '@alifd/next';
import ReactDOM from 'react-dom';

const container = document.createElement('div');

function UnderstandDialog() {
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="了解跨境名词概念"
      onClose={onClose}
      visible
      footer={false}
      style={{ width: 640 }}
    >
      <div className="mb-[16px]">
        <div className="text-[14px] text-[#333] font-medium mb-[8px]">1. 什么是托管产品？</div>
        <div className="text-[14px text-[#999]">托管产品：成功托管售卖的商品将会生成对应的托管产品，您需要在托管产品上维护商品价格和库存，托管的商品将不再使用您原商品上的价格和库存信息。</div>
      </div>
      <div>
        <div className="text-[14px] text-[#333] font-medium mb-[8px]"> 2.「JIT发货」与「入仓发货」有什么不同？</div>
        <div className="text-[14px text-[#999]">JIT发货（Just In Time）：是指商家无需提前备货，直接送到指定仓库，由商家自己配送或者接受平台上门揽的模式。入仓发货：是指商家需要提前将商品备货至平台官方仓库，由官方仓库进行库存管理、履约运营、国内外配送的模式。（功能准备中，暂未上线）</div>
      </div>
    </Dialog>
  );
}

UnderstandDialog.open = (props) => {
  ReactDOM.render(<UnderstandDialog props={props} />, container);
};

export default UnderstandDialog;
