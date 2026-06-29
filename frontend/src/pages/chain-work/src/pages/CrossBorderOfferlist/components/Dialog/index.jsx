import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog, Checkbox, Icon, Balloon, Message } from '@alifd/next';
import './index.scss';
import { submitShopEnrollInfo, CommissionZwfxServiceSign } from '../../api';
import { Htqq_QY } from '@/pages/CrossBorderOfferlist/variables';
import { signAgreement } from '@/pages/Replenishment/services/action';
import logger from '@alife/channel-uni-event-logger';

const dataList = [
  {
    id: 1,
    url: 'https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20231215171709856/20231215171709856.html',
    text: '《1688跨境货通全球入驻协议》',
  },
  {
    id: 2,
    url: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240108153142381/20240108153142381.html',
    text: '《1688数智供应链技术服务协议》',
  },
  {
    id: 3,
    url: 'https://contract.alibaba-inc.com/documentcoop/editor/page/preview?securityDocumentId=Gy4d2Q5-NkjZp9FBHiux_Q&securityDialogDocumentId=&dialogShowType=always&securityAgreementId=S9BeDbRAJfLi25jx0zwo1Q#/',
    text: '《中国商家个人信息跨境传输同意函》',
  },
  {
    id: 4,
    url: 'https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051',
    text: '《支付宝付款授权服务协议》',
  },
];
const CrossBorderOfferlistDialog = (props) => {
  const [visible, setVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  // const [checkedValue, setCheckedValue] = useState();

  const onOk = () => {
    logger.report({
      actionType: 'CLK_加入货通全球弹窗_一键入驻',
    });
    if (isChecked) {
      submitShopEnrollInfo(5117313).then((res) => {
        // CommissionZwfxServiceSign(); // 签署数字供应链接口
        signAgreement(5121025); // 签署数字供应链接口
        setVisible(false);
        props?.callback && props?.callback();
      });
    } else {
      Message.warning('请签署协议');
    }
  };

  const titleDom = () => {
    return (
      <>
        <img
          src="https://img.alicdn.com/imgextra/i4/O1CN01fsJhpu26w6VzEoudc_!!6000000007725-0-tps-38-32.jpg"
          className="title-img"
        />
        1688跨境货通全球绿通资格限时领取
      </>
    );
  };

  // const checkboxOnChange = (value) => {
  //   setCheckedValue(value);
  // };
  const onChange = (checked) => {
    setIsChecked(checked);
  };
  const fullDialogStyle = {
    width: '600px',
    borderRadius: '12px',
  };

  return (
    <>
      <Dialog
        v2
        title={<div className="text-[16px] font-medium">1688跨境货通全球绿通资格限时领取</div>}
        visible={visible}
        // onOk={onOk}
        closeIcon={<span />}
        // footer={false}
        footerAlign="center"
        style={fullDialogStyle}
        footer={
          <Button type="primary" disabled={!isChecked} onClick={onOk} style={{ borderRadius: '6px' }} >
            立即加入
          </Button>
        }
        className="cross-border-dialog"
      >
        <div className="text-[#666] text-[14px] mb-[20px]">
          尊敬的1688会员为了更好的服务跨境买家，帮助商家扩大销量，1688平台全新推出“1688货通全球”，您店铺内的商品已被选中并直接绿通到1688海外站点以及寻源通、全球直采等跨境渠道。覆盖全球超170个国家和地区，请您立即完成入驻，否则将影响商品在跨境渠道的展示转化等权益，错失生意商机。
          <a className="text-[#0077FF]" href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/amweZ92PV6vZazqqcaa5PZw4VxEKBD6p" target="_blank" rel="noreferrer">了解货通全球</a>
        </div>
        <div className="text-[#333] text-[14px] flex">
          <Checkbox checked={isChecked} onChange={onChange} />
          <div className="ml-[8px] text-[#333333]">
            我同意加入1688跨境货通全球，并签署
            {dataList?.map((ele) => (
              <a
                className="text-[#0077FF]"
                href={ele?.url}
                target="_blank"
                rel="noreferrer"
                key={ele?.id}
              >
                {ele?.text}
              </a>
            ))}
            ，知晓该商品站外订单将收取千分之六的技术服务费，符合优惠政策的订单按照实际活动规则收取。(
            <a href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/amweZ92PV6vZazqqcaa5PZw4VxEKBD6p" target="_blank" rel="noopener noreferrer">技术服务费说明</a>)
          </div>
        </div>

        {/* <div className="dialog-footer">
          <div className="dialog-btn">
            <Button type="primary" onClick={onOk}>
              一键入驻1688货通全球
            </Button>
          </div>
        </div> */}
      </Dialog>
    </>
  );
};

CrossBorderOfferlistDialog.open = (callback) => {
  ReactDOM.render(<CrossBorderOfferlistDialog callback={callback} />, document.createElement('div'));
};

export default CrossBorderOfferlistDialog;
