import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/UI/Carousel';
import { Divider } from '@alifd/next';
import SingleProductRecruitmentCard from './SingleProductRecruitmentCard';
import BalloonFatigue from './BalloonFatigue';
import { getDirectedItems, getChoiceDirectOppCard } from '../services';
import Message from '@/components/UI/Message';

function SingleProductRecruitment() {
  const [directedItems, setDirectedItems] = useState({
    list: [],
    total: 0,
  });
  const [tabMap, setTabMap] = useState([]);
  const [action, setAction] = useState('0');
  const faceDirectedItems = (strategyId) => {
    getDirectedItems({
      request: {
        pageSize: 15,
        pageNum: 1,
        strategyId,
      },
    }).then((res) => {
      setDirectedItems(res);
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '数据异常', type: 'error' });
    });
  };
  useEffect(() => {
    getChoiceDirectOppCard().then((res) => {
      const { model = [], success, msg = '数据异常' } = res;
      if (success) {
        setAction(model[0]?.strategyId);
        setTabMap(model);
        faceDirectedItems(model[0]?.strategyId);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '数据异常', type: 'error' });
    });
  }, []);
  const onTab = (strategyId) => {
    setAction(strategyId);
    faceDirectedItems(strategyId);
  };
  const EmptyCard = () => {
    return (
      <div className="w-[280px] h-[100px] flex flex-col gap-y-[12px] p-[16px] border-solid border-[1px] border-[#F2F2F2] rounded-[6px] bg-[#fff] text-[12px] text-[#999] leading-[12px] items-center justify-center">
        暂无商机
      </div>
    );
  };
  const navigateWithQueryParams = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('strategyId', action);
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/singleproductrecruitment.html${search}`;
  };
  return (
    <div className="mt-[24px]">
      <div className="flex flex-row justify-between">
        <div className="text-[16px] text-[#333] font-[500] mb-[12px]">
          <BalloonFatigue
            trigger={<span className="cursor-pointer">Choice单品定招</span>}
            title="新增“Choice单品定招”"
            fatigueKey="Choice-single-balloon-fatigue"
            content="托管定向招品从原“爆品孵化”“爆品全托管”页面迁移至Choice单品定招模块，您可以点击查看全部看到所有的定招商机，点击“去提报”完成报名。"
          />
          <span className="text-[#999] text-[12px] font-normal ml-[8px]">定招商机品加入后可获得海外投流/定向加权/大客推荐等专属权益</span>
        </div>
        <div>
          <span className="text-[#999] text-[14px] font-normal">共{directedItems?.total}个商机</span>
          {directedItems?.total > 0 && (
            <>
              <Divider direction="ver" className="h-[15px]" />
              <span className="text-[#0077FF] text-[14px] font-normal cursor-pointer" onClick={navigateWithQueryParams}>查看全部</span>
            </>
          )}
        </div>
      </div>
      {tabMap?.length > 0 && (
        <div className="flex mb-[12px]">
          {tabMap?.map(({ oppName = '', strategyId = '' }) => {
            return (
              <div
                key={strategyId}
                onClick={() => onTab(strategyId)}
                className={`p-[8px] inline-table text-[14px] leading-[17px] font-medium mr-[8px] rounded-[4px] cursor-pointer ${action === strategyId ? 'text-[#0077FF] bg-[#EBF6FF]' : 'text-[#333] bg-[#F8F8F8]'}`}
              >
                {oppName}
              </div>
            );
          })}
        </div>
      )}
      <div>
        <Carousel className="w-full">
          <CarouselContent className="items-end">
            {
              directedItems?.list?.map((item) => {
                return (
                  <CarouselItem className="w-[280px]" key={item.itemId}>
                    <SingleProductRecruitmentCard {...item} />
                  </CarouselItem>
                );
              })
            }
            {
              !directedItems?.list?.length && (
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
      {tabMap?.length > 0 && (
        <div className="mt-[12px] text-[14px] leading-[17px] text-[#333] p-[10px] rounded-[4px]" style={{ background: 'linear-gradient(90deg, #EBF6FF -12%, rgba(255, 255, 255, 0) 48%)' }}>
          权益说明：{tabMap?.find((item) => item.strategyId === action)?.oppText}
        </div>
      )}
    </div>
  );
}

export default SingleProductRecruitment;
