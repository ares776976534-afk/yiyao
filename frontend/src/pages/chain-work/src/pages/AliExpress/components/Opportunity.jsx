import React, { useEffect, useState, useRef } from 'react';
import Button from '@/components/UI/Button';
import { Checkbox, Pagination } from '@alifd/next';
import { getOppByCondition, signUp } from '../services';
import { querySignAgreement } from '@/pages/CrossBorderOfferlist/api';
import Message from '@/components/UI/Message';

const Card = ({ itemId, imageUrl, title, price, oppTextList, oppMatchId }) => {
  return (
    <div className="flex flex-row p-[12px] rounded-[6px] w-[248px] bg-[#ffffff] border border-[#0000000d]">
      <div className="w-[60px] h-[60px] relative">
        <div className="absolute top-[-1px] left-0 leading-[16px] rounded-[6px]">
          <Checkbox value={oppMatchId} />
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

export default ({ onClose, onSuccess = () => { }, strategyId = null }) => {
  const [checked, setChecked] = useState([]);
  const [total, setTotal] = useState(0);
  const [sign, setSign] = useState(false);
  const [signDisable, setSignDisable] = useState(false);
  const [pageNum, setPage] = useState(1);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkedAll, setCheckedAll] = useState(true);
  const [dataList, setDataList] = useState([]);
  const [checkedNum, setCheckedNum] = useState(0);
  const checkedRef = useRef([]);
  const filter = useRef([]); // 存被取消勾选的数据

  const handleCheck = (v) => {
    if (checkedAll) {
      const currentOppMatchIds = dataList.map((item) => item.oppMatchId);
      const unselectedInCurrentPage = currentOppMatchIds.filter((id) => !v.includes(id));
      const newFilter = [
        ...new Set([...unselectedInCurrentPage, ...filter.current.filter((id) => !currentOppMatchIds.includes(id))]),
      ];
      filter.current = newFilter;
      checkedRef.current = [];
      setIndeterminate(total - filter?.current?.length !== total);
      setCheckedNum(total - filter?.current?.length);
    } else {
      filter.current = [];
      checkedRef.current = [
        ...new Set([...checkedRef.current, ...v]),
      ];
      setCheckedNum(checkedRef?.current?.length);
      setIndeterminate(total - checkedRef?.current?.length !== total);
    }
    setChecked(v);
  };

  const handleCheckAll = (v) => {
    if (!v) {
      // 清空当前选中项
      setChecked([]);
      setCheckedNum(0);
    } else {
      // 设置全选状态为当前页的所有 ID
      setChecked(dataList.map((item) => item.oppMatchId));
      setCheckedNum(total);
    }
    filter.current = [];
    setCheckedAll(v);
    setIndeterminate(false);
  };
  const handlePageChange = (v) => {
    setPage(v);
  };
  const init = () => {
    querySignAgreement({ agreementEnum: 'AE' }).then((res) => {
      setSign(res?.content?.data);
      setSignDisable(res?.content?.data);
    });
    getOppByCondition({
      request: {
        pageNum,
        pageSize: PAGE_SIZE,
        strategyId,
      },
    }).then((res) => {
      const { success, list, msg, total: totalItems } = res || {};
      setTotal(totalItems);
      if (success) {
        let currentOppMatchIds = [];
        currentOppMatchIds = list.map((item) => item.oppMatchId);
        if (checkedAll) {
          const initialChecked = currentOppMatchIds.filter(
            (id) => !filter.current.includes(id),
          );
          setChecked(initialChecked);
          setCheckedNum(totalItems - filter.current.length);
        } else {
          setChecked(checkedRef.current);
          setCheckedNum(checkedRef?.current?.length);
        }
        setDataList(list || []);
      } else {
        Message._show({ content: msg || '数据异常，请稍后再试', type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '数据异常，请稍后再试', type: 'error' });
    });
  };

  const handleSubmit = () => {
    signUp(JSON.stringify({
      signUpSource: 'OPP_SPECIFIED',
      strategyId,
      oppMatchIds: checkedRef.current,
      excludeOppMatchIds: filter.current,
    })).then((res) => {
      const { success, msg } = res || {};
      if (success) {
        onClose && onClose();
        Message._show({ content: '提报成功', type: 'success' });
        onSuccess && onSuccess();
      } else {
        Message._show({ content: msg || '数据异常，请稍后再试', type: 'error' });
      }
    });
  };

  const handleSign = () => {
    if (!signDisable) {
      setSign(!sign);
    }
  };
  useEffect(() => {
    init();
  }, [pageNum]);
  return (
    <div className="w-[760px]">
      <div className="mb-[12px] text-[#333] text-[14px]">
        您的店铺已有<span className="text-[#FF8B00]">{total}</span>个商品被速卖通爆品商机选中，
        点击提报后将直通速卖通渠道<span className="text-[#0077ff] cursor-pointer" onClick={() => window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/dQPGYqjpJYg0vYGGcl6ap4BDWakx1Z5N#4ever-bi-24', '_blank')}>销售</span>，请保障商品在活动期间在架，并注意遵守履约规则和发货时效。
      </div>
      <div>
        <Checkbox.Group onChange={handleCheck} value={checked}>
          <div className="flex flex-row flex-wrap gap-[8px]">
            {
              dataList.map((item) => {
                return <Card key={item.oppMatchId} {...item} />;
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
              <span className="text-[#FF8B00] ml-[4px]">{checkedNum}</span>
              /{total}
            </span>
          </div>
          <div>
            <Pagination total={total} pageSize={PAGE_SIZE} onChange={handlePageChange} shape="no-border" type="simple" />
          </div>
        </div>
        <div className="flex flex-row items-start mt-[16px]">
          <Checkbox checked={sign} onChange={(v) => setSign(v)} disabled={signDisable} />
          <div className={`ml-[8px] text-[12px] ${!signDisable ? 'text-[#333]' : 'text-[#999]'}`} onClick={handleSign}>
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
      </div >
      <div className="flex flex-row items-center justify-center gap-x-[12px] mt-[16px]">
        <Button type="primary" disabled={!sign || !checked.length} onClick={handleSubmit}>立即提报</Button>
        <Button onClick={onClose}>取消</Button>
      </div>
    </div >
  );
};
