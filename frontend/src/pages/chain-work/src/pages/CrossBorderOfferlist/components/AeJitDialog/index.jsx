import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog, Checkbox, Message } from '@alifd/next';
import './index.scss';
// import { signAgreement, signShopInfoAgreement, signKjPayAgreement } from '@/pages/Replenishment/services/action';
import logger from '@alife/channel-uni-event-logger';
import { getSignAgreement } from './services';

const container = document.createElement('div');

const AeJitDialog = ({ props }) => {
  const [isChecked, setIsChecked] = useState(false);
  const dialogRef = React.createRef();

  const onOk = async () => {
    logger.report({
      actionType: 'CLK_加入跨境速卖通弹窗_一键入驻',
    });
    getSignAgreement({
      agreementEnum: 'AE',
    }).then((res) => {
      if (res?.success) {
        ReactDOM.unmountComponentAtNode(container);
        props?.callback && props?.callback();
        Message.success(res?.msg);
        logger.report({
          actionType: 'CLK_加入跨境速卖通弹窗_一键入驻_成功',
        });
      } else {
        Message.error(res?.msg);
      }
    }).catch(() => {
      Message.warning('签署失败，请重试');
    });
    // try {
    //   const [agreementRes, shopInfoAgreementRes, signKjPayAgreementRes] = await Promise.all([
    //     signAgreement(5091265),
    //     signShopInfoAgreement(660291),
    //     signKjPayAgreement(),
    //   ]);
    //   if (agreementRes && shopInfoAgreementRes && signKjPayAgreementRes) {
    //     ReactDOM.unmountComponentAtNode(container);
    //     Message.success('签署成功');

    //     logger.report({
    //       actionType: 'CLK_加入跨境速卖通弹窗_一键入驻_成功',
    //     });
    //   }
    // } catch (error) {
    //   Message.warning('签署失败，请重试');
    // }
  };

  const titleDom = () => {
    return (
      <div className="flex flex-row items-center">
        <img
          src="https://img.alicdn.com/imgextra/i4/O1CN01fsJhpu26w6VzEoudc_!!6000000007725-0-tps-38-32.jpg"
          className="title-img"
        />
        1688跨境“速卖通优选”活动入驻
      </div>
    );
  };

  const checkboxOnChange = (value) => {
    setIsChecked(value);
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
      title={titleDom()}
      onClose={(e) => {
        ReactDOM.unmountComponentAtNode(container);
      }}
      visible
      style={fullDialogStyle}
      className="ae-jit-dialog"
      footer={
        <Button type="primary" onClick={onOk} style={{ borderRadius: '6px' }} disabled={!isChecked}>
          一键入驻
        </Button>
      }
      footerAlign="center"
    >
      <div className="text-[#333] text-[14px] mb-[20px]">
        <div className="mb-[4px]">尊敬的1688会员：</div>
        <div>
          恭喜您的商品被速卖通商机命中，签署后就有机会参与速卖通专属频道销售机会，获取更多海外渠道流量！如您已接到速卖通订单，需咨询更多细节，可
          <a className="a" href="https://qr.dingtalk.com/action/joingroup?code=v1,k1,eFNFqs6nUBzh7p9QgM6WbD5NdIJTqCMM7cK2dLBQo+g=&_dt_no_comment=1&origin=11?" target="_blank" rel="noreferrer">联系专属小二</a>
          或
          <a className="a" href="https://survey.1688.com/apps/zhiliao/I2oE-j7j2" target="_blank" rel="noreferrer">提交工单</a>
          咨询！
        </div>
      </div>
      <div className="flex mb-[10px] text-[#333] text-[14px]">
        <Checkbox onChange={checkboxOnChange} />
        <div className="ml-[8px]">
          我同意入驻速卖通渠道，签署
          <a
            href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240524204617685/20240524204617685_1_0_22987.html"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            {' '}
            《直通“速卖通优选”服务协议》
          </a>
          <a
            href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/AR4GpnMqJzML1lddtEKRkQ2yVKe0xjE3"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            {' '}
            《“速卖通优选”活动规则》
          </a>
          <a
            href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/qnYMoO1rWxDl12ddcOOB0aAGW47Z3je9"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            {' '}
            《“速卖通优选”招商规则》
          </a>
          <a
            href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20230928094558858/20230928094558858.html"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            《信息共享授权书》
          </a>
          <a
            href="https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            《支付宝付款授权协议》
          </a>
          ，知晓商品在速卖通渠道的订单将按照优惠政策抽取 <span style={{ color: '#ff4d4f' }}>5%</span>
          的技术服务费。
        </div>
      </div>
    </Dialog>
  );
};

AeJitDialog.open = (props) => {
  ReactDOM.render(<AeJitDialog props={props} />, container);
};

export default AeJitDialog;
