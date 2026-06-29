import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog, Checkbox, Message } from '@alifd/next';
import './index.scss';
import { signAgreement } from '@/pages/Replenishment/services/action';
import logger from '@alife/channel-uni-event-logger';
import { logisiticsAgreement, submitShopEnrollInfo } from '@/pages/ProductsBidding/api';

const container = document.createElement('div');

const AgreementSigningDialog = (props) => {
  const [visible, setVisible] = useState(true);
  const [checkedValue, setCheckedValue] = useState();

  const dialogRef = React.createRef();

  const onOk = async () => {
    if (checkedValue) {
      const [enrollInfoRes1, enrollInfoRes2, enrollInfoRes3] = await Promise.all([
        submitShopEnrollInfo(577987),
        submitShopEnrollInfo(5117313),
        logisiticsAgreement(),
      ]);
      // 检查协议是否签署成功
      if (enrollInfoRes1?.data?.data || enrollInfoRes2?.data?.data || enrollInfoRes3?.data?.success) {
        ReactDOM.unmountComponentAtNode(container);
        Message.success('签署成功');
        logger.report({
          actionType: 'CLK_速卖通协议签署弹窗_确认签署',
        });
        props?.callback && props?.callback();
      } else {
        Message.warning('签署失败');
      }
    } else {
      Message.warning('请签署协议');
    }
  };

  const checkboxOnChange = (value) => {
    setCheckedValue(value);
  };

  return (
    <Dialog
      ref={dialogRef}
      v2
      onClose={() => {
        ReactDOM.unmountComponentAtNode(container);
      }}
      visible={visible}
      width="640px"
      footer={false}
    >
      <div className="dialog-text low-margin">尊敬的1688会员：</div>
      <div className="dialog-text text-indent-2em">尊敬的1688会员，参与速卖通专属渠道需要签署如下协议，请确认。</div>
      <div>
        <Checkbox onChange={checkboxOnChange}>
          <div className="dialog-a-box">
            我同意签署
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240517210818311/20240517210818311.html"
              rel="noreferrer"
              target="_blank"
              className="submit-products-a"
            >
              《直通“速卖通爆品”托管技术服务协议》
            </a>
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/suit_bu1_b2b/suit_bu1_b2b202104192035_47290.html"
              rel="noreferrer"
              target="_blank"
              className="submit-products-a"
            >
              《1688官方物流综合解决方案服务协议》
            </a>
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/suit_bu1_b2b/suit_bu1_b2b202112271356_41414.html"
              rel="noreferrer"
              target="_blank"
              className="submit-products-a"
            >
              《1688官方物流信息授权协议》
            </a>
            {/* <a
              href="https://terms.alicdn.com/legal-agreement/terms/platform_service/20220809201145426/20220809201145426.html"
              rel="noreferrer"
              target="_blank"
              className="submit-products-a"
            >
              《1688官方物流保障服务协议》
            </a> */}
            <a
              href="https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051"
              rel="noreferrer"
              target="_blank"
              className="submit-products-a"
            >
              《支付宝代扣协议》
            </a>
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20231215164403513/20231215164403513.html"
              rel="noreferrer"
              target="_blank"
              className="submit-products-a"
            >
              《信息共享授权书》
            </a>
          </div>
        </Checkbox>
      </div>

      <div className="dialog-footer">
        <div className="dialog-btn">
          <Button type="primary" onClick={onOk}>
            确认签署
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

AgreementSigningDialog.open = (callback) => {
  ReactDOM.render(<AgreementSigningDialog callback={callback} />, container);
};

export default AgreementSigningDialog;
