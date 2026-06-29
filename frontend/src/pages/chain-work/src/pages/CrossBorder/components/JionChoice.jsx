import React, { useEffect, useState } from 'react';
import { Dialog, Button, Checkbox, Balloon, Field } from '@alifd/next';
import './HelpSellDialog.scss';
import ReactDOM from 'react-dom';
import { querySignSelect } from '../services';
import SelectHostingChannel from '@/pages/Select/components/SelectHostingChannel';
import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';

const cardList = [
  {
    id: 1,
    title: '全新境外市场',
    content: '已上线越南、哈萨克斯坦和全球站点，更多站点陆续上线中',
  },
  {
    id: 2,
    title: '流量扶持',
    content: '搜索、推荐、场域，超多流量红利',
  },
  {
    id: 3,
    title: '限时免费入驻',
    content: '0抽佣，0仓储费，0海外物流费用',
  },
];
const container = document.createElement('div');
function JionChoice({ props }) {
  const { onOk } = props;
  const field = Field.useField({ parseName: true });
  const [checked, setChecked] = useState(false);
  const dialogRef = React.createRef();
  const [sign, setSign] = useState(false);
  const [signDisable, setSignDisable] = useState(false);
  useEffect(() => {
    querySignSelect()
      .then((res) => {
        setSign(res);
        setChecked(res);
        setSignDisable(res);
      });
  }, []);
  const handleSign = () => {
    if (!signDisable) {
      setSign(!sign);
    }
  };
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
  };
  const onChecked = (v) => {
    setChecked(v);
  };
  const handleOk = () => {
    onOk(!!field.getValue('isDomesticEntrust')).then((res) => {
      if (res) {
        onClose();
      }
    });
  };
  const CheckboxItem = ({ isChecked, onChange, description, linkText, linkUrl, description2 }) => (
    <div className="flex mb-[10px] text-[14px]" onClick={handleSign}>
      <Checkbox checked={isChecked} onChange={onChange} disabled={signDisable} />
      <div className={`ml-[8px] text-[#333333] ${!signDisable ? 'text-[#333]' : 'text-[#999]'}`}>
        {description}
        <a
          className="text-[#0077FF]"
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
        >
          {linkText}
        </a>
        {description2}
      </div>
    </div>
  );
  return (
    <Dialog
      ref={dialogRef}
      className="select-help-sell-dialog rounded-xl"
      v2
      title="全店商品加入Choice"
      visible
      onClose={onClose}
      footerAlign="center"
      style={{ width: 800 }}
      footer={
        <div>
          <Balloon.Tooltip
            trigger={
              <Button className="mr-[8px]" type="primary" onClick={handleOk} disabled={!checked}>
                立即加入
              </Button>
            }
            align="t"
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            <span>加入后商品会自动开启48h发货</span>
          </Balloon.Tooltip>
          <Button onClick={onClose} >
            我再想想
          </Button>
        </div>
      }
    >
      <img
        className="absolute top-[-17px] right-[30px] w-[130px]"
        src="https://img.alicdn.com/imgextra/i1/O1CN01qgwk8Y1b2ulReASY1_!!6000000003408-2-tps-520-524.png"
        alt=""
        srcSet=""
      />
      <div className="text-[#333] mb-[12px]">
        1688跨境业务重磅升级，抢占全球市场，目前已经上线越南站点、哈萨克斯坦站点和全球站点，后续会有更多站点陆续上线。满足条件的跨境商品目前将会
        <span className="text-[#FF8B00]">免费</span>
        在站点展示，<span className="text-[#FF8B00]">不收取入驻费用</span>！
        同时平台将会面向境外消费者推出<span className="text-[#FF8B00]">“Choice”商品</span>，原有的“全球严选”和”select“商品标签将不会再对消费者展示，境外站点将仅展示“Choice”商品标签。商品加入跨境托管且满足48h发货后即可成为“Choice”商品。
      </div>
      <div className="text-[14px] mb-[12px] text-[#333]">Choice订单不会和安心购、先采后付（诚意赊）、货通全球、全球严选等产生叠加费用。</div>
      <div className="mt-[24px]">
        <div className="flex flex-row gap-x-[20px] mb-[20px]">
          {cardList?.map((ele) => (
            <div key={ele?.id} className="w-[242.67px] h-[103px] min-w-[220px] rounded-[6px] opacity-100 flex flex-row items-center p-[20px] gap-[16px] flex-grow bg-[#F5FAFF]">
              <div className="w-[202.67px] h-[63px] rounded-[6px] opacity-100 flex flex-col p-0 gap-[8px] flex-grow backdrop-blur-[10px]">
                <div className="text-[16px] font-medium leading-[17px] text-[#333333]">{ele?.title}</div>
                <div className="text-[12px] font-normal leading-[19px] text-[#999999]">{ele?.content}</div>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="text-[#333] text-[14px]">
          <span className="font-medium">三个利益点：全新境外市场 · 流量扶持 · 限时免费入驻</span>
          <span className="text-[#999]">
            （0抽佣，0仓储费，0海外物流费用）
          </span>
        </div> */}
        <div className="text-[14px] mt-[24px] mb-[16px] text-[#333]">
          全店加入后无需手动提报跨境商机，先人一步抢占订单。商品默认以
          <span className="text-[#FF8B00]">一档价或SKU价*0.94</span>提供给1688，并
          <span className="text-[#FF8B00]">自动开启48h发货</span>，后续商家可根据需求自行修改价格；后续店铺新增的商品也会自动加入到Choice中。
        </div>
        <div className="flex mb-[16px] items-center">
          <BalloonPrompt />
          <div className="text-[14px] font-medium text-[#333] mr-[12px] ml-[8px]">托管渠道:</div>
          <SelectHostingChannel field={field} />
        </div>
      </div>
      <div className="checkbox-btn">
        <CheckboxItem
          isChecked={checked}
          onChange={onChecked}
          description="我同意加入1688数字供应链托管服务并签署"
          linkText="《1688数字供应链托管技术服务协议》"
          linkUrl="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240412180443509/20240412180443509.html"
          description2="，知晓该商品将委托由1688负责商品展示、1688平台站内/外营销场景、销售渠道、物流、售后等。并委托我们向商家提供以商家名义向买家履行商品交付、售后义务的托管服务。"
        />
      </div>
    </Dialog>
  );
}

JionChoice.open = (props) => {
  ReactDOM.render(<JionChoice props={props} />, container);
};

export default JionChoice;
