import React, { useEffect, useState } from 'react';
import SaleData from './SaleData';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/UI/Carousel';
import { Button, Divider, Balloon, Icon } from '@alifd/next';
import { Logger } from '@/utlis';
import DepositPaymentDialog from './DepositPaymentDialog';

const { Tooltip } = Balloon;

const tabMap = [
  {
    title: '经营待办',
    key: '1',
  },
  {
    title: '经营数据',
    key: '2',
  },
];
const tabStyle = 'flex items-center justify-center text-center h-[60px] top-0 absolute cursor-pointer';
const img1 = 'https://img.alicdn.com/imgextra/i1/O1CN016y79JY1MCKknjo4ni_!!6000000001398-2-tps-46-60.png';
const OperateCard = ({ title = '', text = '', action = '', effect = '', backlog = '', backlogFormat = '', tips = '', actionCode = '', data, handleActionClick }) => {
  const jumpAddress = (param) => {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/${param}.html`, '_blank');
  };
  const actionMap = {
    BARGAIN_CONFIRM: 'bargaininggoods',
    JIT_GO_SHIP: 'jitperformance',
    PWS_ALERT_CONFIRM: 'weightwaring',
  };
  const actionText = {
    BARGAIN_CONFIRM: '提高价格力',
    JIT_GO_SHIP: '订单待发货',
    PWS_ALERT_CONFIRM: '件重尺预警',
  };
  const onClick = () => {
    switch (actionCode) {
      case 'BARGAIN_CONFIRM':
      case 'JIT_GO_SHIP':
      case 'PWS_ALERT_CONFIRM':
        Logger.report({ d: 'CLK', e: `2经营待办${actionText[actionCode]}点击按钮@funnel_${action}` });
        return jumpAddress(actionMap[actionCode]);
      case 'KJ_BOND_PAY':
        DepositPaymentDialog.open({ data, handleActionClick });
        break;
      default:
        return <></>;
    }
  };
  const [beforeValue, afterValue] = backlog.split('{value}');
  const valueElement = <span className="text-[#333] text-[18px] leading-[22px] mr-[4px] font-medium">{backlogFormat}</span>;
  return (
    <div
      className="w-[260px] p-[16px] rounded-[6px] bg-[#fff]"
      data-report-primary-key={title}
      data-report-attribute-exp={`1经营待办曝光@funnel_${title}`}
    >
      <div className="flex">
        <div className="text-[#333] text-[16px] font-medium mb-[12px] leading-[19px] mr-[8px]">
          {title}
          {tips && (
            <Tooltip
              v2
              trigger={<Icon type="help" className="text-[#BBB]" />}
              align="t"
              arrowPointToCenter
              popupClassName="notic-borad-tooltip bg-[#333] text-[14px] leading-[22px] p-[12px]"
            >
              {tips}
            </Tooltip>
          )}
        </div>
        <div className="inline-table h-[20px] px-[4px] rounded-[3px] text-[#FB3B20] text-[12px]" style={{ backgroundColor: 'rgba(251, 59, 32, 0.12)' }}>{effect}</div>
      </div>
      <div className="text-[14px] text-[#999] leading-[22px]">
        {text?.length < 32 ? (
          <div dangerouslySetInnerHTML={{ __html: text }} className="text-ellipsis line-clamp-2" />
        ) : (
          <Tooltip
            v2
            trigger={<div dangerouslySetInnerHTML={{ __html: text }} className="text-ellipsis line-clamp-2" />}
            align="t"
            arrowPointToCenter
            popupClassName="notic-borad-tooltip bg-[#333] text-[14px] leading-[22px] p-[12px]"
          >
            <div dangerouslySetInnerHTML={{ __html: text }} />
          </Tooltip>
        )}
      </div>
      <Divider className="my-[12px]" style={{ backgroundColor: 'rgba(0, 119, 255, 0.12)' }} dashed />
      <div className="flex justify-between items-center">
        <div className="text-[#666] text-[14px] leading-[17px]">
          {beforeValue}
          {valueElement}
          {afterValue}
        </div>
        <Button type="primary" style={{ borderRadius: '6px' }} onClick={onClick}>{action}</Button>
      </div>
    </div>
  );
};
function OperateTab({ cards, action, setAction, dataList, isLoading, data, handleActionClick }) {
  return (
    <div className="relative h-[273px]">
      <img className="w-full rounded-[6px] h-[273px]" src="https://img.alicdn.com/imgextra/i4/O1CN01Hy4XXi1IwoU6P2AKy_!!6000000000958-2-tps-819-261.png" alt="" srcSet="" />
      <div className="h-[59px] flex absolute top-0 left-0 right-0 h-[60px] pt-[22px] pb-[15px] w-full">
        {tabMap.map(({ title, key }) => {
          return (
            <div key={key}>
              <div
                onClick={() => setAction(key)}
                style={{ width: 'calc(50% - 23px)' }}
                className={`${key === '1' ? 'left-0 text-[#fff]' : 'right-0 bg-[#fff] rounded-tr-[6px]'} ${tabStyle} ${action === key ? 'font-medium text-[20px] leading-[24px]' : 'font-normal text-[18px] leading-[22px]'}`}
              >
                {title}{key === '1' && `(${cards?.length})`}
              </div>
              {key === '1' && (
                <img
                  style={{ transform: action === key ? 'rotate(180deg)' : 'scaleX(-1)', left: 'calc(50% - 23px)' }}
                  className="absolute top-0 left-[50%] w-[46px] h-[60px]"
                  src={img1}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className={`w-full absolute bottom-0 left-0 ${action === '2' && 'h-[213px]'} ${action === '1' ? 'pt-[25px] pb-[24px] px-[20px]' : 'p-[20px] bg-[#fff] rounded-tl-[6px] rounded-b-[6px]'}`} >
        {action === '1' ? (
          <Carousel className="w-full">
            <CarouselContent className="items-end">
              {cards?.map((item) => {
                return (
                  <CarouselItem className="w-[260px]" key={item.title}>
                    <OperateCard {...item} data={data} handleActionClick={handleActionClick} />
                  </CarouselItem>
                );
              })}
              {!cards?.length && (
                <CarouselItem className="w-full">
                  <div
                    className="rounded-[6px] h-[164px] text-[14px] flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}
                  >
                    <span className="opacity-40">暂无待办</span>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <SaleData dataList={dataList} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}

export default OperateTab;
