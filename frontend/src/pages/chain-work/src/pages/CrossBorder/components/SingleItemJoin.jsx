import React, { useEffect, useState } from 'react';
import Button from '@/components/UI/Button';
import { Checkbox, Balloon } from '@alifd/next';
import { signSelect, querySignSelect, addChoiceItem } from '../services';
import { MessageError, MessageSuccess } from '@/utlis';

const Card = ({ itemId, imageUrl, title }) => {
  return (
    <div className="flex flex-row p-[12px] rounded-[6px] bg-[#f8f8f8] border border-[#0000000d]">
      <div className="w-[56px] h-[56px] relative">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[6px]" />
      </div>
      <div className="flex flex-col ml-[8px] gap-y-[4px]">
        <div className="text-[#333333] text-[14px] truncate w-[372px] h-[17px] leading-[22px]">{title}</div>
        <div className="text-[#999999] text-[14px] h-[17px]">ID：{itemId}</div>
      </div>
    </div>
  );
};


export default ({ onClose, onSuccess, data: itemInfo }) => {
  const [sign, setSign] = useState(false);
  const [signDisable, setSignDisable] = useState(false);
  const [no, setNo] = useState(false);
  const handlePost = () => {
    addChoiceItem({
      request: {
        choiceItemIds: [itemInfo.itemId],
        doNotShowPop: no,
      },
    })
      .then(({ success, msg }) => {
        if (success) {
          MessageSuccess(msg || '加入成功，可在[已报名Choice]列表中进行管理');
          onSuccess();
          onClose();
        } else {
          MessageError(msg || '系统繁忙，请稍后再试');
        }
      });
  };

  const handleSubmit = () => {
    if (!signDisable) {
      signSelect()
        .then(({ success }) => {
          if (success) {
            handlePost();
          } else {
            MessageError('协议签署失败，请重试');
          }
        });
    } else {
      handlePost();
    }
  };

  useEffect(() => {
    querySignSelect()
      .then((res) => {
        setSign(res);
        setSignDisable(res);
      });
  }, []);

  return (
    <div className="w-[460px]">
      <div className="mb-[12px] text-[14px] text-[#333]">
        1688跨境业务重磅升级，抢占全球市场，目前已经上线越南站点、哈萨克斯坦站点和全球站点，后续会有更多站点陆续上线。满足条件的跨境商品目前将会
        <span className="text-[#FF8B00]">免费</span>在站点展示，
        <span className="text-[#FF8B00]">不收取入驻费用</span>！同时平台将会面向境外消费者推出
        <span className="text-[#FF8B00]">“Choice”商品</span>，原有的“全球严选”和”select“商品标签将不会再对消费者展示，境外站点将仅展示“Choice”商品标签。商品加入跨境托管且满足48h发货后即可成为“Choice”商品。
      </div>
      <div className="text-[14px] mb-[12px] text-[#333]">
        商品默认以<span className="text-[#FF8B00]">一档价或sku价*0.94</span>提供给1688，后续商家可根据需求自行修改价格；并
        <span className="text-[#FF8B00]">自动开启48h发货</span>。
      </div>
      <div className="text-[14px] mb-[12px] text-[#333]">Choice订单不会和安心购、先采后付（诚意赊）、货通全球、全球严选等产生叠加费用。</div>
      <div>
        <Card {...itemInfo} />
        <div className="flex flex-row items-start mt-[12px]" onClick={() => !signDisable && setSign(!sign)}>
          <Checkbox checked={sign} disabled={signDisable} />
          <span className="ml-[8px] text-[12px] text-[#333]">
            我同意加入1688数字供应链托管服务并签署
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240412180443509/20240412180443509.html"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#0077FF' }}
            >
              《1688数字供应链托管技术服务协议》
            </a>
            ，知晓该商品将委托由1688负责商品展示、1688平台站内/外营销场景、销售渠道、物流、售后等。并委托我们向商家提供以商家名义向买家履行商品交付、售后义务的托管服务。
          </span>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-x-[12px] mt-[12px] mb-[12px]">
        <Balloon.Tooltip
          trigger={<Button type="primary" disabled={!sign} onClick={handleSubmit} style={{ borderRadius: '6px' }}>立即加入</Button>}
          align="t"
          popupStyle={{ backgroundColor: '#333' }}
          popupClassName="products-business-tooltips"
        >
          <span>加入后商品会自动开启48h发货</span>
        </Balloon.Tooltip>
        <Button onClick={onClose} style={{ borderRadius: '6px' }}>我再想想</Button>
      </div>
      <div className="flex flex-row items-center justify-center">
        <Checkbox onChange={(checked) => setNo(checked)}>下次不再显示该弹窗，直接加入Choice</Checkbox>
      </div>
    </div >
  );
};
