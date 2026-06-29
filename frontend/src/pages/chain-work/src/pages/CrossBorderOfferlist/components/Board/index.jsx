import React, { useEffect, useState } from 'react';
import DataBoard from '../DataBoard';
import { Divider, Button } from '@alifd/next';
// import { qqjx_agreement_text_cell } from '@/pages/CrossBorderOfferlist/utils';
import { getGlobalYxDataBoard, getGlobalYxMemberRightDashboard } from '@/pages/CrossBorderOfferlist/api';
import Message from '@/components/UI/Message';
import RightBoard from '../RightBoard';
import { TIME_RANGE } from '../../variables';

function Board({ setIsBusinessComp }) {
  const [active, setActive] = useState('last7Days');
  const [isDataBoardLoading, setIsDataBoardLoading] = useState(false);
  const [isEquityBoardLoading, setIsEquityBoardLoading] = useState(false);
  const [dataRight, setDataRight] = useState({});
  const [dataList, setDataList] = useState([]);
  const [data, setData] = useState({});
  const queryGetGlobalYxDataBoard = () => {
    setIsDataBoardLoading(true);
    getGlobalYxDataBoard().then((res) => {
      const { success = false, model, msg } = res || {};
      if (success) {
        setData(model);
        setDataList(model[active]);
      } else {
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
      setIsDataBoardLoading(false);
    });
  };
  useEffect(() => {
    queryGetGlobalYxDataBoard();
    setIsEquityBoardLoading(true);
    getGlobalYxMemberRightDashboard().then((res) => {
      const { success = false, msg, model } = res || {};
      if (success) {
        setDataRight(model);
      } else {
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
      setIsEquityBoardLoading(false);
    });
  }, []);
  const onTab = (key) => {
    setIsDataBoardLoading(true);
    setTimeout(() => {
      setDataList(data[key]);
      setIsDataBoardLoading(false);
    }, 500);
    setActive(key);
  };
  // const handleClick = () => {
  //   // isDialogClick();
  //   checkSellerStatus();
  //   // const params = {
  //   //   title: '加入全球严选，享受核心资源',
  //   //   subtitle: '您有多款商品被跨境买家选中，商品将获得标题、主图、详情页AI智能多语言翻译和卖点提炼，更可在跨境专供频道、寻源通API、全球直采、寻源换供等跨境渠道获得核心资源扶持，请您立即将全量被选中商品加入“全球严选”，获取跨境订单！了解更多权益',
  //   //   agreementCellLabel: qqjx_agreement_text_cell,
  //   // };
  //   // updateDialogFunc(true, '全球严选', params);
  //   // setUpdateCount();
  //   setTimeout(() => {
  //   }, 500);
  //   setFrom('全球严选');
  // };
  return (
    <div className="flex mt-[16px]">
      <div className="h-[257px] bg-[#fff] p-[20px] rounded-[6px] shadow-[0px_1px_12px_0px_rgba(0, 0, 0, 0.01)] mr-[16px] flex-1">
        <div className="flex row items-center justify-between">
          <div className="text-[16px] text-[#333] font-[500] h-[19px] leading-[19px]">
            全球严选数据
            <span className="text-[12px] text-[#999] ml-[12px]">{data?.updateTime}</span>
          </div>
          <div>
            {TIME_RANGE.map((ele) => (
              <React.Fragment key={ele.key}>
                <span
                  onClick={() => onTab(ele.key)}
                  className={`text-[12px] ${active === ele.key ? 'text-[#0077FF]' : 'text-[#666]'} cursor-pointer`}
                >
                  {ele.title}
                </span>
                {ele.key !== 'last30Days' && <Divider direction="ver" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <DataBoard isLoading={isDataBoardLoading} dataList={dataList} />
      </div>
      <RightBoard dataRight={dataRight} setIsBusinessComp={setIsBusinessComp} />
      {/* <div className="w-[400px] bg-[#fff] p-[16px] rounded-[6px] shadow-[0px_1px_12px_0px_rgba(0, 0, 0, 0.01)] relative">
        <div className="flex row items-start justify-between">
          <div className="text-[16px] text-[#333] font-[500] h-[19px] leading-[19px]">全球严选商家</div>
          <Button type="primary" style={{ borderRadius: '6px' }} onClick={handleClick}>全店加入</Button>
        </div>
        <div className="text-[12px] text-[#999] font-normal absolute top-[40px]">
          {status ? '已加入' : '未加入'}
        </div>
        <EquityBoard isLoading={isEquityBoardLoading} dataRight={dataRight} />
      </div> */}
    </div>
  );
}

export default Board;
