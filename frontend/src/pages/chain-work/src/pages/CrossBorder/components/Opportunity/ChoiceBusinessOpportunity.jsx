import React from 'react';
import { Dialog, Balloon } from '@alifd/next';
import Button from '@/components/UI/Button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/UI/Carousel';
import JoinOpportunity from './JoinOpportunity';
import CountDown from '@/components/CountDown';
import { shopJoinChoice } from '@/pages/Select/services';
import HelpSellDialog from '../JionChoice';
import { MessageSuccess, MessageError, Logger } from '@/utlis';

const CardLayout = ({ title, desc, tip, trafficRight, action, strategyId }) => {
  return (
    <div
      className="w-[280px] flex flex-col p-[16px] border-solid border-[1px] border-[#F2F2F2] rounded-[6px] bg-[#fff]"
      data-report-primary-key={strategyId}
      data-report-attribute-exp={'1Choice商机推荐曝光@funnel_Choice商机'}
    >
      <div className="text-[14px] text-[#333] font-medium h-[17px] mb-[8px]">
        {title}
      </div>
      <div className="h-[61px]">
        {desc?.length < 20 ? (
          <span className="w-[246px] text-[12px] text-[#999] leading-[19px] h-[38px] text-ellipsis line-clamp-2"> {title}</span>
        ) : (
          <Balloon.Tooltip
            trigger={<div className="w-[246px] text-[12px] text-[#999] leading-[19px] h-[38px] text-ellipsis line-clamp-2 cursor-pointer">{desc}</div>}
            align="t"
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            <div className="text-[12px] leading-[19px]">{desc}</div>
          </Balloon.Tooltip>
        )}
        {trafficRight && (
          <div className="text-[12px] text-[#999] leading-[12px] h-[12px] mt-[4px]">
            流量权益：{trafficRight}
          </div>
        )}
      </div>
      <div className="flex flex-row items-center justify-between mt-[8px]">
        <div className="flex flex-row items-center">
          {tip}
        </div>
        {action}
      </div>
    </div>
  );
};

const JoinCard = (props) => {
  const { isShopJoinChoice, fetchChoiceBaseInfo, init } = props;
  const Title = () => {
    return (
      <div className="flex flex-row items-center">
        全店商品加入Choice
        {!isShopJoinChoice && <img src="https://img.alicdn.com/imgextra/i1/O1CN013bgTkH1t7BYR0ug8V_!!6000000005854-2-tps-84-42.png" className="w-[28px] h-[14px] ml-[4px]" />}
      </div>
    );
  };
  const onOk = (isDomesticEntrust) => {
    return new Promise((resolve) => {
      shopJoinChoice({ request: { isDomesticEntrust: isDomesticEntrust || undefined } }).then((res) => {
        const { success, model, msg = '系统繁忙，请稍后再试。' } = res;
        if (success && model) {
          fetchChoiceBaseInfo();
          MessageSuccess('加入成功，可在「已加入Choice」列表中进行管理。');
          init();
          resolve(success);
        } else {
          MessageError(msg);
        }
      }).catch(() => {
        MessageError('系统繁忙，请稍后再试。');
      });
    });
  };
  return (
    <CardLayout
      title={<Title />}
      desc={!isShopJoinChoice ? '全新海外站点，快速获取跨境增量订单；加入后无需手动提报跨境商机，先人一步抢占订单。' : '店铺的所有商品已加入Choice，新增的商品将自动加入其中，无需手动提报Choice商机。'}
      tip={null}
      action={
        <div className={`flex flex-row items-center w-[248px] ${!isShopJoinChoice ? 'justify-between' : 'justify-end'}`}>
          {!isShopJoinChoice && <span className="text-[12px] text-[#999] leading-[12px]"><span className="text-[#FF8B00]">82%</span>同行已加入</span>}
          <Button type="primary:primary-small" disabled={isShopJoinChoice} onClick={() => { HelpSellDialog.open({ onOk }); }}>{!isShopJoinChoice ? '一键加入' : '您已加入'}</Button>
        </div>
      }
    />
  );
};

const OpportunityCard = ({ oppName = '-', oppText = '-', strategyId = null, endTime = null, startTime = new Date().valueOf(), onSuccess = () => { }, trafficRight = '-' }) => {
  const Tip = () => {
    return (
      <>
        <span className="text-[12px] text-[#999] leading-[12px] mr-[6px]">倒计时</span>
        <CountDown endTime={endTime} startTime={startTime}>
          {
            ({
              day,
              hour,
              min,
              second,
            }) => {
              return <span className="text-[12px] text-[#FF7300] leading-[12px]">{day ? `${day}天 ` : ''}{hour}:{min}:{second}</span>;
            }
          }
        </CountDown>
      </>
    );
  };

  const handleJoin = () => {
    Logger.report({ d: 'CLK', e: '2Choice商机点击按钮@funnel_提报' });
    const dialog = Dialog.show({
      title: <span className="text-[16px] font-medium text-[#333]">{oppName}</span>,
      content: <JoinOpportunity strategyId={strategyId} onClose={() => dialog.hide()} onSuccess={onSuccess} oppName={oppName} />,
      footer: false,
      width: 800,
      className: 'join-opportunity-dialog',
    });
  };

  return (
    <CardLayout
      title={oppName}
      desc={oppText}
      trafficRight={trafficRight}
      tip={<Tip />}
      strategyId={strategyId}
      action={<Button type="primary:primary-small" onClick={handleJoin}>立即提报</Button>}
    />
  );
};

const EmptyCard = () => {
  return (
    <div className="w-[280px] h-[152px] flex flex-col gap-y-[12px] p-[16px] border-solid border-[1px] border-[#F2F2F2] rounded-[6px] bg-[#fff] text-[12px] text-[#999] leading-[12px] items-center justify-center">
      更多商机即将来袭
    </div>
  );
};

export default (props) => {
  const { isShopJoinChoice, fetchChoiceBaseInfo, tableQuery, init, data } = props;
  const handleCardSuccess = () => {
    init();
    tableQuery.current();
  };

  return (
    <div>
      <div className="text-[16px] text-[#333] font-[500] leading-[19px] mb-[12px]">
        Choice商机推荐
      </div>
      <Carousel className="w-full">
        <CarouselContent className="items-end">
          <CarouselItem className="w-[280px]">
            <JoinCard isShopJoinChoice={isShopJoinChoice} fetchChoiceBaseInfo={fetchChoiceBaseInfo} init={init} />
          </CarouselItem>
          {
            data.map((item) => (
              <CarouselItem className="w-[280px]" key={item.strategyId}>
                <OpportunityCard {...item} onSuccess={handleCardSuccess} />
              </CarouselItem>
            ))
          }
          {
            !data.length && (
              <CarouselItem className="w-[280px]">
                <EmptyCard />
              </CarouselItem>
            )
          }
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
