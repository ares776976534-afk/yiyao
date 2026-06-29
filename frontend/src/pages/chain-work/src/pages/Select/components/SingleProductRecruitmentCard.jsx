import React from 'react';
import CountDown from '@/components/CountDown';
import { Balloon, Button } from '@alifd/next';
import { Logger } from '@/utlis';

function SingleProductRecruitmentCard({ title, imageUrl, itemId, strategyId, endTime = null, currentTime = new Date().valueOf() }) {
  const hasImage = !!imageUrl;
  const Tip = () => {
    return (
      <>
        <span className="text-[12px] text-[#999] leading-[12px] mr-[6px]">距结束</span>
        <CountDown endTime={endTime} startTime={currentTime}>
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
    Logger.report({ d: 'CLK', e: '2Choice单品定招点击按钮@funnel_去提报' });
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('itemId', itemId);
    currentUrl.searchParams.set('strategyId', strategyId);
    currentUrl.searchParams.set('recruitType', 'direct');
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/choicesingleproductrecruitment.html${search}`;
  };
  return (
    <div
      className="w-[280px] p-[12px] rounded-[6px] border-solid border-[1px] border-[#F2F2F2]"
      data-report-primary-key={itemId}
      data-report-attribute-exp={'1Choice单品定招曝光@funnel_卡片'}
    >
      <div className="flex">
        {hasImage && <img className="rounded-[6px] w-[48px] h-[48px] mr-[10px]" src={imageUrl} alt="img" />}
        <div className="flex flex-col">
          {title?.length < 14 ? (
            <span className="w-[184px] text-[13px] text-[#333] text-ellipsis line-clamp-1"> {title}</span>
          ) : (
            <Balloon.Tooltip
              trigger={<div className="w-[184px] text-[13px] text-[#333] text-ellipsis line-clamp-1">{title}</div>}
              align="t"
              popupStyle={{ backgroundColor: '#333' }}
              popupClassName="products-business-tooltips"
            >
              <span className="">{title}</span>
            </Balloon.Tooltip>
          )}
          <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
        </div>
      </div>
      <div className="flex flex-row items-end justify-between mt-[4px]">
        <div className="flex flex-row items-center">
          <Tip />
        </div>
        <Button type="primary" onClick={submitReport} style={{ height: '24px' }}>去提报</Button>
      </div>
    </div>
  );
}

export default SingleProductRecruitmentCard;
