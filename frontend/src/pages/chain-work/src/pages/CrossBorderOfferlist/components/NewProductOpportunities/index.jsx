import React, { useState, useEffect } from 'react';
import { Divider, Balloon } from '@alifd/next';
import Message from '@/components/UI/Message';
import Button from '@/components/UI/Button';
import { getOppByCondition } from '@/pages/AliExpress/services';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/UI/Carousel';
import { DeliverModal } from '@/pages/OverseasBusinessOpportunities/NewOPP/DeliverModal';
import { ViewModal } from '@/pages/OverseasBusinessOpportunities/NewOPP/ViewModal';
import { getOppFilterOption } from '@/pages/CrossBorderOfferlist/api';
import { Logger } from '@/utlis';

const NewProductOpportunities = ({ onLoaded }) => {
  const [data, setData] = useState([]);
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [deliverData, setDeliverData] = useState({});
  const [sameModalVisible, setSameModalVisible] = useState(false);
  const [id, setid] = useState('');
  const [oppOptionList, setoppOptionList] = useState([]);
  const [oppOptionAction, setoppOptionAction] = useState('');
  const queryOppByCondition = (oppType) => {
    getOppByCondition({
      request: {
        distributeChannel: 'QQYX_NEW_ITEM',
        pageNum: 1,
        pageSize: 10,
        oppType,
      },
    }).then((res) => {
      const { success, list, msg } = res || {};
      if (success) {
        setData(list);
      } else {
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
  };
  useEffect(() => {
    getOppFilterOption({
      distributeChannel: 'QQYX_NEW_ITEM',
    }).then((res) => {
      const { success, model, msg } = res || {};
      if (success) {
        setoppOptionList(model?.oppOption);
        queryOppByCondition(model?.oppOption[0]?.code);
        setoppOptionAction(model?.oppOption[0]?.code);
        // 数据加载完成后调用回调
        onLoaded?.();
      } else {
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
  }, [onLoaded]);
  const handleClick = (type) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', type);
    const { origin, search } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/overseasbusinessopportunities.html${search}`, '_blank');
    // window.location.href = `${origin}/app/channel-fe/chain-work/overseasbusinessopportunities.html${search}`;
  };
  const oppOptionClick = (type) => {
    setoppOptionAction(type);
    queryOppByCondition(type);
  };
  return (
    <div className="p-[20px] rounded-[6px] mt-[16px] bg-[#fff]" style={{ boxShadow: '0px 1px 12px 0px rgba(0, 0, 0, 0.01)' }}>
      <div className="flex justify-between items-center">
        <div className="text-[#333] leading-[16px] text-[16px] font-medium">机会新品</div>
        <div className="flex items-center">
          {data.length > 0 && (
            <>
              <span className="text-[13px] cursor-pointer text-[#07f]" onClick={() => handleClick('QQYX_NEW_ITEM')}>查看全部</span>
              <Divider direction="ver" className="bg-[#333]" />
            </>
          )}
          <span className="text-[13px] cursor-pointer text-[#07f]" onClick={() => handleClick('RECORD')}>商机品报名记录</span>
        </div>
      </div>
      <div className="flex gap-[12px] mt-[16px]">
        {oppOptionList?.map(({ desc, code }) => (
          <div
            className={`
              py-[7.5px]
              px-[12px]
              rounded-[6px]
              inline-table
              text-[14px]
              cursor-pointer
              ${oppOptionAction === code ? 'bg-[#fff] text-[#07f] border border-[#07f]' : 'bg-[#F2F2F2] text-[#333] border border-transparent'}
            `}
            onClick={() => oppOptionClick(code)}
          >
            {desc}
          </div>
        ))}
      </div>
      <Carousel className="w-full">
        <CarouselContent className="items-end">
          {
            data?.map((ele) => {
              const { title, imageUrl, oppType, matchItemCnt, oppMatchId, price, extraInfo = '[]', priceLabel, priceTips } = ele || {};
              return (
                <CarouselItem className="w-[212px]" key={oppMatchId} data-report-primary-key={oppMatchId} data-report-attribute-exp={`1机会新品卡片曝光@funnel_${title}`}>
                  <div className="p-[16px] w-[212px] h-[326px] bg-[#fff] rounded-[6px] mt-[16px]" style={{ border: '1px solid #E5E5E5' }}>
                    <div className="w-[180px] h-[180px] rounded-[6px] overflow-hidden flex items-center justify-center bg-[#fff]">
                      <img src={imageUrl} alt="" srcSet="" className="w-full h-full rounded-[6px] object-cover" />
                    </div>
                    <div className="text-[#333] leading-[17px] text-[14px] font-medium text-ellipsis line-clamp-1 mt-[12px]">{title}</div>
                    <div className="flex items-center justify-between mt-[4px] text-[13px] leading-[16px]">
                      {priceTips ? (
                        <Balloon.Tooltip
                          trigger={<div className="text-[#333]"><span>{priceLabel} </span>¥ {price}</div>}
                          align="t"
                          popupStyle={{ backgroundColor: '#333' }}
                          popupClassName="products-business-tooltips"
                        >
                          {priceTips}
                        </Balloon.Tooltip>
                      ) : (
                        <div className="text-[#333]">
                          <span>{priceLabel} </span>
                          ¥ {price}
                        </div>
                      )}
                      <div className="text-[#666]">{oppType}</div>
                    </div>
                    <div className="text-[#666] leading-[14px] text-[12px] flex items-center justify-between mt-[4px] mb-[12px]">
                      <div>
                        站内同款
                        <span
                          className={`font-medium cursor-pointer ml-[4px] ${matchItemCnt > 0 ? 'text-[#07f]' : 'text-[#ccc]'}`}
                          onClick={matchItemCnt > 0 ? () => {
                            setSameModalVisible(true);
                            setid(oppMatchId);
                          } : undefined}
                        >
                          {matchItemCnt}
                        </span>


                      </div>
                      {JSON.parse(extraInfo)?.map((item) => {
                        if (item?.isHomeDisplay) {
                          return (
                            <div className="flex items-center">
                              {item?.label}
                              <span className="text-[#333] font-medium"> {item?.value}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      type="normal:primary-ghost"
                      style={{ borderRadius: '6px', width: '180px', height: '32px' }}
                      onClick={() => {
                        Logger.report({ d: 'CLK', e: '2机会新品卡片点击按钮@funnel_发同款' });
                        setDeliverModalVisible(true);
                        setDeliverData(ele);
                      }}
                    >
                      发同款
                    </Button>
                  </div>
                </CarouselItem>
              );
            })
          }
          {
            !data.length && (
              <CarouselItem className="w-full">
                <div className="flex mt-[8px] items-center justify-center text-[14px] text-[#999] leading-[17px] mb-[12px]">
                  暂无商机
                </div>
              </CarouselItem>
            )
          }
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <DeliverModal
        visible={deliverModalVisible}
        onClose={() => setDeliverModalVisible(false)}
        data={deliverData}
      />
      <ViewModal
        visible={sameModalVisible}
        onClose={() => setSameModalVisible(false)}
        oppMatchId={id}
      />
    </div>

  );
};

export default NewProductOpportunities;
