import React, { useState, useEffect } from 'react';
import { Dialog, Button, Checkbox, Balloon, Message, Field } from '@alifd/next';
import ReactDOM from 'react-dom';
import { addChoiceItem, querySignSelect } from '../services';
import { MessageError, MessageSuccess } from '@/utlis';
import SelectHostingChannel from '@/pages/Select/components/SelectHostingChannel';
import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';

const container = document.createElement('div');

function BatchJoinChoiceDialog({ props }) {
  const { isShow, record, fn, RefreshTrigger } = props;
  const [visible, setVisible] = useState(isShow);
  const field = Field.useField({ parseName: true });
  const [isChecked, setIsChecked] = useState(false);
  const dialogRef = React.createRef();
  const [sign, setSign] = useState(false);
  const [signDisable, setSignDisable] = useState(false);
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const onChange = (checked) => {
    setIsChecked(checked);
  };
  function processArray(arr) {
    let successCount = 0;
    let errCount = 0;
    // 遍历数组，统计成功和失败的数量
    arr.forEach(item => {
      if (item.isSuccess) {
        successCount++;
      } else {
        errCount++;
      }
    });
    // 确定 model 值
    let model;
    if (successCount === arr.length) {
      model = 'success';
    } else if (errCount === arr.length) {
      model = 'err';
    } else {
      model = 'waring';
    }
    // 返回结果对象
    return {
      model,
      successCount,
      errCount,
    };
  }
  const onOk = () => {
    addChoiceItem({
      request: {
        choiceItemIds: record.map((item) => item.itemId),
        isDomesticEntrust: !!field.getValue('isDomesticEntrust') || undefined,
      },
    }).then((res) => {
      if (res.success && res.model) {
        const { model, successCount, errCount } = processArray(res.model);
        fn();
        onClose();
        switch (model) {
          case 'success':
            MessageSuccess(`${successCount}个商品加入成功，可在「已加入Choice」列表中进行管理。`);
            break;
          case 'err':
  <Message title={<div>{successCount}个商品加入成功，可在[已加入Choice]列表中进行管理；</div>} type="warning">
    {errCount}个商品因系统繁忙报名失败，请稍后再试
  </Message>;
            break;
          case 'waring':
            MessageError(`${successCount}个商品因系统繁忙报名失败，请稍后再试。`);
            break;
          default:
            return [];
        }
        RefreshTrigger();
      } else {
        MessageError(`${record.map(item => item.itemId).length}个商品因系统繁忙报名失败，请稍后再试。`);
      }
    }).catch(err => {
      MessageError(err || '系统异常');
    });
  };
  useEffect(() => {
    querySignSelect()
      .then((res) => {
        setSign(res);
        setIsChecked(res);
        setSignDisable(res);
      });
  }, [])
  const handleSign = () => {
    if (!signDisable) {
      setSign(!sign);
    }
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="批量加入Choice"
      onClose={onClose}
      visible={visible}
      footer={
        <div>
          <Balloon.Tooltip
            trigger={
              <Button type="primary" disabled={!isChecked} onClick={onOk} style={{ borderRadius: '6px', marginRight: '12px' }} >
                立即加入
              </Button>
            }
            align="t"
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            <span>加入后商品会自动开启48h发货</span>
          </Balloon.Tooltip>
          <Button onClick={onClose} style={{ borderRadius: '6px' }}>
            我再想想
          </Button>
        </div>
      }
      footerAlign="center"
      className="batch-join-choice-dialog"
    >
      <div className="text-[14px] mb-[12px] text-[#333]">
        您已勾选<span className="text-[#FF8B00]">{record.length}</span>个商品加入Choice，加入后商品默认以
        <span className="text-[#FF8B00]">一档价或sku价*0.94</span>提供给1688，并
        <span className="text-[#FF8B00]">自动开启48h发货</span>，后续商家可根据需求自行修改价格。
      </div>
      <div className="text-[14px] mb-[12px] text-[#333]">Choice订单不会和安心购、先采后付（诚意赊）、货通全球、全球严选等产生叠加费用。</div>
      <div className="flex mb-[16px] items-center">
        <BalloonPrompt />
        <div className="text-[14px] font-medium text-[#333] mr-[12px] ml-[8px]">托管渠道:</div>
        <SelectHostingChannel field={field} />
      </div>
      <div className="text-[#333] text-[12px] flex">
        <Checkbox checked={isChecked} onChange={onChange} onClick={handleSign} disabled={signDisable} />
        <div className={`ml-[8px] text-[#333333] ${!signDisable ? 'text-[#333]' : 'text-[#999]'}`} >
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

BatchJoinChoiceDialog.open = (props) => {
  ReactDOM.render(<BatchJoinChoiceDialog props={props} />, container);
};

export default BatchJoinChoiceDialog;
