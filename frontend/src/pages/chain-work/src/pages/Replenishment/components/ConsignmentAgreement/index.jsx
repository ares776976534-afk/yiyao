import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog, Checkbox, Icon, Balloon, Message } from '@alifd/next';
import './index.scss';
import { signBuffaloAgreementService } from '../../api';
import logger from '@alife/channel-uni-event-logger';

/**
* 非洲寄售模式协议签约弹窗
*/
const ConsignmentAgreement = (props) => {
  const [visible, setVisible] = useState(true);
  const [checkedValue, setCheckedValue] = useState();

  const onOk = () => {
    if (checkedValue) {
      signBuffaloAgreementService().then((res) => {
        if (res?.data?.model === 'true') {
          setVisible(false);
          logger.report({
            actionType: 'CLK_非洲寄售模式协议签约_确定签约',
          });
          props?.callback && props?.callback();
        }
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
        非洲寄售模式协议签约
      </>
    );
  };

  const checkboxOnChange = (value) => {
    setCheckedValue(value);
  };

  return (
    <>
      <Dialog
        v2
        title={titleDom()}
        visible={visible}
        closeIcon={<span />}
        width="640px"
        footer={false}
      >
        <div className="dialog-text low-margin">尊敬的1688会员：</div>
        <div className="dialog-text text-indent-2em">
          为了更好的服务跨境买家，帮助商家扩大销量，1688平台增设非洲跨境渠道，全新推出“非洲跨境寄售模式”，您店铺内的商品已被选中并直接绿通到专属非洲跨境渠道，请您立即完成入驻，否则将影响商品在跨境渠道的展示转化等权益，错失生意商机。
        </div>
        <div>
          <Checkbox onChange={checkboxOnChange}>
            <div className="dialog-a-box">
              我同意加入1688平台跨境寄售模式服务，签署
              <a
                href="https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20240510103038121/20240510103038121.html"
                target="_blank"
                className="a"
                rel="noreferrer"
              >
                《1688平台跨境寄售模式服务协议》
              </a>
              。
            </div>
          </Checkbox>
        </div>

        <div className="dialog-footer">
          <div className="dialog-btn">
            <Button type="primary" onClick={onOk}>
              确定签约
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

ConsignmentAgreement.open = (callback) => {
  ReactDOM.render(<ConsignmentAgreement callback={callback} />, document.createElement('div'));
};


export default ConsignmentAgreement;
