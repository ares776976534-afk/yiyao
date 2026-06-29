import React, { useEffect, useState } from 'react';
import Button from '@/components/UI/Button';
import { Checkbox, Pagination, Message, Balloon, Field } from '@alifd/next';
import { querySignSelect, querySignUpItem, signSelect, postSignUpItem } from '../../services';
import SelectHostingChannel from '@/pages/Select/components/SelectHostingChannel';
import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';
import { Logger } from '@/utlis';

const Card = ({ itemId, imageUrl, title, price, oppTextList }) => {
  return (
    <div
      className="flex flex-row p-[12px] rounded-[6px] w-[248px] bg-[#ffffff] border border-[#0000000d]"
      data-report-primary-key={title}
      data-report-attribute-exp={'1泛招商机弹窗曝光@funnel_卡片'}
    >
      <div className="w-[60px] h-[60px] relative">
        <div className="absolute top-[-1px] left-0 leading-[16px] rounded-[6px]">
          <Checkbox value={itemId} />
        </div>
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-[6px]" />
      </div>
      <div className="flex flex-col ml-[8px] gap-y-[4px]">
        <div className="text-[#333] text-[14px] truncate w-[156px] h-[17px]">{title}</div>
        <div className="text-[#333] text-[14px] h-[17px]">￥{price}</div>
        <div className="text-[#999] text-[14px] h-[17px]">ID：{itemId}</div>
        {oppTextList?.map((item) => {
          return <div className="text-[#333] text-[14px] truncate w-[156px] h-[17px]" key={item}>{item}</div>;
        })}
      </div>
    </div>
  );
};

const PAGE_SIZE = 9;

export default ({ onClose, onSuccess = () => { }, strategyId = null, oppName = '' }) => {
  const [data, setData] = useState([]);
  const field = Field.useField({ parseName: true });
  const [checked, setChecked] = useState([]);
  const [total, setTotal] = useState(0);
  const [sign, setSign] = useState(false);
  const [signDisable, setSignDisable] = useState(false);
  const [page, setPage] = useState(1);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const _data = [].concat([], data).splice((page - 1) * PAGE_SIZE, PAGE_SIZE);

  const handleCheck = (v) => {
    Logger.report({ d: 'CLK', e: `2商机选品按钮@funnel_${v ? '勾选' : '取消勾选'}` });
    setChecked(v);
    if (v.length > 0 && v.length !== data.length) {
      setIndeterminate(true);
    } else if (v.length === data.length) {
      setCheckedAll(true);
      setIndeterminate(false);
    } else {
      setIndeterminate(false);
    }
  };

  const handleCheckAll = (v) => {
    setCheckedAll(v);
    setIndeterminate(false);
    if (v) {
      setChecked(data.map((item) => item.itemId));
    } else {
      setChecked([]);
    }
  };

  const handlePageChange = (v) => {
    setPage(v);
  };

  const init = () => {
    querySignSelect()
      .then((res) => {
        setSign(res);
        setSignDisable(res);
      });
    querySignUpItem(strategyId)
      .then((res) => {
        setData(res.list);
        setTotal(res.total);
      });
  };

  const handlePost = () => {
    postSignUpItem({
      itemIds: checked,
      request: {
        isDomesticEntrust: !!field.getValue('isDomesticEntrust') || undefined,
      },
    })
      .then(({ success, msg }) => {
        if (success) {
          Message.success(msg);
          onSuccess();
          onClose();
        } else {
          Message.error(msg);
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
            Message.error('协议签署失败，请重试');
          }
        });
    } else {
      handlePost();
    }
  };

  const handleSign = () => {
    if (!signDisable) {
      setSign(!sign);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      handleCheckAll(true);
    }
  }, [data]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="w-[760px]">
      <div className="mb-[12px] text-[#333] text-[14px]">
        <div className="font-medium">您有<span className="text-[#FF8B00]">{data.length}</span>个商品被{oppName}商机选中，立即将该商品加入chocie后获取更多跨境订单！</div>
        <div className="text-[13px]">加入后商品默认以<span className="text-[#FF8B00]">一档价或SKU价*0.94</span>提供给1688，并<span className="text-[#FF8B00]">自动开启48h发货</span>，后续商家可根据需求自行修改价格。</div>
        {/* <span className="text-[#FF8B00]">并自动开启48h发货</span>相当于商家新增加一个销售渠道。 */}
        {/* <a className="text-[#07f] text-[14px] visited:text-[#07f]" href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/XPwkYGxZV3RX2pNNSYx34563WAgozOKL" rel="noreferrer" target="_blank">查看Choice规则</a> */}
      </div>
      <div>
        <Checkbox.Group onChange={handleCheck} value={checked}>
          <div className="flex flex-row flex-wrap gap-[8px]">
            {
              _data.map((item) => {
                return <Card key={item.itemId} {...item} />;
              })
            }
          </div>
        </Checkbox.Group>
        <div className="flex flex-row items-center justify-between mt-[8px]">
          <div className="flex flex-row items-center text-[14px] leading-[16px] text-[#333]">
            <Checkbox indeterminate={indeterminate} checked={checkedAll} onChange={handleCheckAll} />
            <span className="ml-[8px] mr-[16px]">全选</span>
            <span>
              已选
              <span className="text-[#FF8B00] ml-[4px]">{checked.length}</span>
              /{data.length}
            </span>
          </div>
          <div>
            <Pagination total={total} pageSize={PAGE_SIZE} onChange={handlePageChange} shape="no-border" type="simple" />
          </div>
        </div>
        <div className="flex mb-[16px] items-center mt-[16px]">
          <BalloonPrompt />
          <div className="text-[14px] font-medium text-[#333] mr-[12px] ml-[8px]">托管渠道:</div>
          <SelectHostingChannel field={field} />
        </div>
        <div className="flex flex-row items-start mt-[16px]">
          <Checkbox checked={sign} onChange={(v) => setSign(v)} disabled={signDisable} />
          <span className={`ml-[8px] text-[12px] ${!signDisable ? 'text-[#333]' : 'text-[#999]'}`} onClick={handleSign}>
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
      </div >
      <div className="flex flex-row items-center justify-center gap-x-[12px] mt-[16px]">
        <Balloon.Tooltip
          trigger={<Button type="primary" disabled={!sign || !checked.length} onClick={handleSubmit}>立即提报</Button>}
          align="t"
          popupStyle={{ backgroundColor: '#333' }}
          popupClassName="products-business-tooltips"
        >
          <span>加入后商品会自动开启48h发货</span>
        </Balloon.Tooltip>
        <Button onClick={onClose}>取消</Button>
      </div>
    </div >
  );
};
