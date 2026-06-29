import React, { useState } from 'react';
import { Dialog, Checkbox, Button } from '@alifd/next';
import { qqjx_agreement_text_cell } from '@/pages/CrossBorderOfferlist/utils';
import { Qqjx_Qy } from '@/pages/CrossBorderOfferlist/variables';
import Message from '@/components/UI/Message';
import { openAutoInvite, signAgreement } from '@/pages/CrossBorderOfferlist/api';
import ReactDOM from 'react-dom';

const container = document.createElement('div');

const QqyxDialog = ({ props }) => {
  const { onOk } = props;
  const dialogRef = React.createRef();
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
  };
  return (
    <Dialog
      ref={dialogRef}
      title="加入全球严选，享受核心资源"
      visible
      onClose={onClose}
      footerAlign="center"
      style={{ width: '800px' }}
      footer={
        <div className="footer-cell">
          <Button
            type="primary"
            onClick={() => {
              openAutoInvite().then((r) => {
                if (r?.content?.success && r?.content?.model) {
                  Message._show({ content: '已开启自动加入全球严选', type: 'success' });
                } else {
                  Message._show({ content: r?.content?.msg || '系统异常', type: 'error' });
                }
              }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
              setButtonLoading(true);
              signAgreement({
                request: {
                  openAutoInvite: true,
                },
              }).then((re) => {
                if (re?.content?.success && re?.content?.model) {
                  Message._show({ content: '1688大严选帮卖技术服务协议,签署成功', type: 'success' });
                  setButtonLoading(false); // 关闭loading
                  ReactDOM.unmountComponentAtNode(container);
                  onOk(true);
                  onClose();
                } else {
                  onOk(false);
                  setButtonLoading(false);
                  Message._show({ content: re?.content?.msg || '系统异常', type: 'error' });
                }
              }).catch((err) => {
                onOk(false);
                setButtonLoading(false);
                Message._show({ content: err.message || '系统异常', type: 'error' });
              });
            }}
            loading={buttonLoading}
            disabled={!checkboxValue}
          >
            立即加入
          </Button>
        </div>
        }
    >
      <div className="text-[#333] text-[14px]">
        商品将获得标题、主图、详情页AI智能多语言翻译和卖点提炼，更可在跨境专供频道、寻源通API、全球直采、寻源换供等跨境渠道获得核心资源扶持，请您立即将全量被选中商品加入“全球严选”，获取跨境订单！
        {
            Qqjx_Qy &&
            <a href={Qqjx_Qy} target="_blank" rel="noreferrer" data-channel-uni-logger-action-type={'CLK_全球严选入驻弹窗_链接_了解更多权益'}>了解更多权益</a>
          }
      </div>
      <div className="mt-[8px] flex">
        <Checkbox
          checked={checkboxValue}
          onChange={(v) => {
            setCheckboxValue(v);
          }}
        />
        <div className="ml-[8px]">{qqjx_agreement_text_cell}</div>
      </div>
    </Dialog>
  );
};

QqyxDialog.open = (props) => {
  ReactDOM.render(<QqyxDialog props={props} />, container);
};

export default QqyxDialog;
