import React from 'react';
import CountDown from '@/components/CountDown';
import { Balloon, Button } from '@alifd/next';
import '../index.scss';
import { Logger } from '@/utlis';

function SingleProductRecruitmentCard({ title, imageUrl, itemId, strategyId, endTime = null, startTime = new Date().valueOf() }) {
  const hasImage = !!imageUrl;
  const Tip = () => {
    return (
      <>
        <span className="text-[12px] text-[#999] leading-[12px] mr-[6px]">距结束</span>
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
  const submitReport = () => {
    Logger.report({ d: 'CLK', e: '2单品定招点击按钮@funnel_去提报' });
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('itemId', itemId);
    currentUrl.searchParams.set('strategyId', strategyId);
    currentUrl.searchParams.set('recruitType', 'direct');
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/choicesingleproductrecruitment.html${search}`;
  };
  return (
    <div
      className="min-w-[300px] p-[12px] rounded-[6px] border-solid border-[1px] border-[#F2F2F2] flex"
      data-report-primary-key={itemId}
      data-report-attribute-exp={'1单品定招曝光@funnel_卡片'}
    >
      {hasImage && (
        <a
          href={`https://detail.1688.com/offer/${itemId}.html`}
          target="_blank"
          rel="noreferrer"
          style={{ cursor: 'pointer' }}
        >
          <div className="rounded-[6px] w-[80px] h-[80px] mr-[10px]">
            <img className="rounded-[6px]" src={imageUrl} alt="img" />
          </div>
        </a>
      )}
      <div className="">
        <Balloon.Tooltip
          trigger={<div className="w-[244px] text-[13px] text-[#333] text-ellipsis line-clamp-1">{title}</div>}
          align="t"
          popupStyle={{ backgroundColor: '#333' }}
          popupClassName="products-business-tooltips"
        >
          {title}
        </Balloon.Tooltip>
        <div className="text-[#999] text-[13px] leading-[13px]">ID：{itemId}</div>
        <div className="flex flex-row items-end justify-between mt-[20px]">
          <div className="flex flex-row items-center">
            <Tip />
          </div>
          <Button type="primary" onClick={submitReport} style={{ height: '24px' }}>去提报</Button>
        </div>
      </div>
    </div>
  );
}

export default SingleProductRecruitmentCard;
