import React, { useState } from 'react';
import { Dialog, Button, Checkbox } from '@alifd/next';
import ReactDOM from 'react-dom';
import './index.scss';
import { choiceUpgrade } from '../../api';
import { MessageError } from '@/utlis';
// import AeJitDialog from '@/pages/CrossBorderOfferlist/components/AeJitDialog';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import AeManufacturerDialog from '@/pages/AeOrder/components/AeManufacturerDialog';

const container = document.createElement('div');

function CrossBorderDialog({ props }) {
  const { navigateWithQueryParams = () => {}, onActionOk = () => {}, onActionClose = () => {} } = props;
  const [isChecked, setIsChecked] = useState(false);
  const dialogRef = React.createRef();
  const onClose = () => {
    onActionClose && onActionClose();
    ReactDOM.unmountComponentAtNode(container);
  };
  const onChange = (checked) => {
    setIsChecked(checked);
    openAeJitDialog();
  };
  const openAeJitDialog = () => {
    querySellerType(660291)
      .then((res) => {
        if (res?.data?.data === 'false') {
          AeManufacturerDialog.open();
        }
      });
  };
  const onOk = () => {
    choiceUpgrade().then((res) => {
      if (res.success && res?.content) {
        if (res?.content.success && res?.content.model) {
          onClose();
          navigateWithQueryParams();
          onActionOk();
          openAeJitDialog();
        } else {
          MessageError(res?.content.msg);
        }
      } else {
        MessageError(res.errorMsg || '系统异常');
      }
    });
  };
  const fullDialogStyle = {
    '--dialog-content-padding-top': '20px',
    '--dialog-content-padding-left': '20px',
    '--dialog-content-padding-right': '20px',
    '--dialog-content-padding-bottom': '20px',
    '--dialog-title-font-size': '16px',
    lineHeight: '19px',
    '--dialog-title-font-weight': '500',
    '--dialog-close-size': '20px',
    '--dialog-title-padding-top': '20px',
    '--dialog-title-padding-left-right': '20px',
    '--dialog-close-top': '20px',
    '--dialog-close-right': '20px',
    width: '640px',
    borderRadius: '12px',
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="跨境新机会！"
      onClose={onClose}
      visible
      footer={
        <Button type="primary" disabled={!isChecked} onClick={onOk} style={{ borderRadius: '6px' }} >
          我已知晓并同意
        </Button>
      }
      style={fullDialogStyle}
      footerAlign="center"
      className="cross-border-dialog"
    >
      <div className="text-[#333] text-[14px]" style={{ textIndent: '28px' }}>
        <span>1688跨境业务重磅升级，抢占全球市场，目前已经上线越南站点、哈萨克斯坦站点和全球站点，后续会有更多站点陆续上线。满足条件的跨境商品目前将会</span>
        <span className="text-[#FF8B00]">免费</span>在站点展示，
        <span className="text-[#FF8B00]">不收取入驻费用</span>！同时平台将会面向境外消费者推出
        <span className="text-[#FF8B00]">“Choice”商品</span>，原有的“全球严选”和”Select“商品标签将不会再对消费者展示，境外站点将仅展示“Choice”商品标签。商品加入跨境托管且满足48h发货后即可成为“Choice”商品。
      </div>
      <div className="text-[#333] text-[14px] font-medium mt-[20px]" style={{ textIndent: '28px' }}>原全球严选商品本月完成一键升级即可获得更多流量权益。</div>
      <div className="text-[#333] text-[14px] mb-[20px]" style={{ textIndent: '28px' }}>升级后商品默认以
        <span className="text-[#FF8B00]">一档价或SKU价*0.94</span>加入Choice，并
        <span className="text-[#FF8B00]">自动开启48h发货</span>，后续商家可根据需求自行修改价格。
      </div>
      <div className="text-[#333] text-[14px] flex">
        <Checkbox checked={isChecked} onChange={onChange} />
        <div className="ml-[8px] text-[#333333]">
          我同意加入1688数字供应链托管服务并签署
          <a
            className="text-[#0077FF]"
            href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240412180443509/20240412180443509.html"
            target="_blank"
            rel="noreferrer"
          >
            《1688数字供应链托管技术服务协议》
          </a>
          ，知晓该商品将委托由1688负责商品展示、1688平台站内/外营销场景、销售渠道、物流、售后等。并委托我们向商家提供以商家名义向买家履行商品交付、售后义务的托管服务。
        </div>
      </div>
    </Dialog>
  );
}

CrossBorderDialog.open = (props) => {
  ReactDOM.render(<CrossBorderDialog props={props} />, container);
};

export default CrossBorderDialog;
