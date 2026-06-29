import React, { useState, useEffect } from 'react';
import { Button, Balloon, Switch, Icon, Divider } from '@alifd/next';
import './index.scss';
import BusinessCard from '@/pages/CrossBorderOfferlist/components/businessComp/businessCard';
import LeadBalloon from '@/components/LeadBalloon';
// import { qqjx_agreement_text_cell } from '@/pages/CrossBorderOfferlist/utils';
import { queryOppGroup, queryIsAutoInvite, openAutoInvite, closeAutoInvite, queryCommissionAgreement, signAgreement } from '@/pages/CrossBorderOfferlist/api';
import Message from '@/components/UI/Message';
import QqyxDialog from './QqyxDialog';
import { getOppCard } from '@/pages/AliExpress/services';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/UI/Carousel';
import { Logger } from '@/utlis';

const BusinessComp = (props) => {
  const { balloonVisible, total, updateBusinessFunc } = props;
  const [data, setData] = useState([]);
  // const [checked, setChecked] = useState(false);
  // const handleClick = (_type) => {
  //   isDialogClick();
  //   checkSellerStatus();
  //   const params = {
  //     title: '加入全球严选，享受核心资源',
  //     subtitle: '您有多款商品被跨境买家选中，商品将获得标题、主图、详情页AI智能多语言翻译和卖点提炼，更可在跨境专供频道、寻源通API、全球直采、寻源换供等跨境渠道获得核心资源扶持，请您立即将全量被选中商品加入“全球严选”，获取跨境订单！了解更多权益',
  //     agreementCellLabel: qqjx_agreement_text_cell,
  //   };
  //   updateDialogFunc(true, _type, params);
  //   setUpdateCount();
  //   setTimeout(() => {
  //   }, 500);
  //   setFrom('全球严选');
  // };
  // const mainBusinessCell = () => {
  //   return (
  //     <div className="main-business">
  //       <div className="title">全球严选</div>
  //       <img src="https://img.alicdn.com/imgextra/i4/O1CN012y4YiU1jEpxMJ5Ct6_!!6000000004517-2-tps-64-64.png" />
  //       <div className="desc">
  //         {
  //           Number(total) > 0 ? `您有${total}个商品已达到入驻门槛，请尽快报名，优先直供跨境大客户。` : '暂时未有符合条件的商品，请您尽快优化商品相关指标达到入驻门槛。'
  //         }
  //       </div>
  //       <a
  //         href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/XPwkYGxZV3RX2pNNSAnGX0ZZWAgozOKL"
  //         target="_blank"
  //         rel="noreferrer"
  //       >查看全球严选权益
  //       </a>
  //       <Button
  //         type="primary"
  //         data-channel-uni-logger-action-type={'CLK_货通全球_一键加入全球严选'}
  //         className="item-botton"
  //         size="medium"
  //         onClick={() => handleClick('全球严选')}
  //       >一键加入
  //       </Button>
  //     </div>
  //   );
  // };
  const getData = () => {
    getOppCard({
      request: {
        distributeChannel: 'QQYX_SHOP_ITEM',
      },
    }).then((res) => {
      const { success, model, msg } = res || {};
      if (success) {
        setData(model);
      } else {
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
  }
  useEffect(() => {
    getData();
    // queryOppGroup().then((res) => {
    //   const result = res.data;
    //   if (result && result?.data) {
    //     setData(result.data);
    //   }
    // });
    // queryIsAutoInvite().then((res) => {
    //   const { success, msg, model } = res?.content;
    //   if (success) {
    //     setChecked(model);
    //   } else {
    //     Message._show({ content: msg || '系统异常', type: 'error' });
    //   }
    // }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
  }, []);
  const handleCardSuccess = () => {
    Logger.report({ d: 'CLK', e: '2店铺商机卡片点击按钮@funnel_去提报' });
    getData();
  };
  // const checkedChange = (key) => {
  //   setChecked(key);
  //   if (key) {
  //     openAutoInvite().then((res) => {
  //       const { success, msg, model } = res?.content;
  //       if (success && model) {
  //         Message._show({ content: '已开启自动加入全球严选', type: 'success' });
  //       } else {
  //         Message._show({ content: msg || '系统异常', type: 'error' });
  //       }
  //     }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
  //   } else {
  //     closeAutoInvite().then((res) => {
  //       const { success, msg, model } = res?.content;
  //       if (success && model) {
  //         Message._show({ content: '已关闭自动加入全球严选', type: 'success' });
  //       } else {
  //         Message._show({ content: msg || '系统异常', type: 'error' });
  //       }
  //     }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
  //   }
  // };
  // const onSwitchChange = (key) => {
  //   // 查询商家是否加入全球严选
  //   queryCommissionAgreement().then((res) => {
  //     const { success, msg, model } = res?.content;
  //     if (success) {
  //       if (model) {
  //         checkedChange(key);
  //       } else {
  //         QqyxDialog.open({ onOk: (k) => { checkedChange(k); } });
  //       }
  //     } else {
  //       Message._show({ content: msg || '系统异常', type: 'error' });
  //     }
  //   }).catch((err) => {
  //     Message._show({ content: err.message || '系统异常', type: 'error' });
  //   });
  // };
  const handleClick = (type) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', type);
    const { origin, search } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/overseasbusinessopportunities.html${search}`, '_blank');
    // window.location.href = `${origin}/app/channel-fe/chain-work/overseasbusinessopportunities.html${search}`;
  }
  return (
    <div className="business-comp">
      {/* {
        balloonVisible ?
          <LeadBalloon
            v2
            triggerType="focus"
            visible={false}
            title="全球严选一键入驻"
            trigger={mainBusinessCell()}
            align="t"
            className="lead-balloon"
            childrenCell="批量入驻全球严选，权益叠加订单不停，畅享跨境红利"
          /> : mainBusinessCell()
      } */}
      <div className="business-list-comp rounded-[6px]">
        <div className="flex justify-between items-center">
          <div className="business-comp-list-title">店铺品商机</div>
          <div className="flex items-center">
            {data.length > 0 && (
              <>
                <span className="text-[13px] cursor-pointer text-[#07f]" onClick={() => handleClick('QQYX_SHOP_ITEM')}>查看全部</span>
                <Divider direction="ver" className="bg-[#333]" />
              </>
            )}
            <span className="text-[13px] cursor-pointer text-[#07f]" onClick={() => handleClick('RECORD')}>商机品报名记录</span>
          </div>
          {/* <div className="flex items-center">
            <Switch autoWidth checked={checked} defaultChecked={false} onChange={onSwitchChange} style={{ width: '44px' }} />
            <span className="text-[14px] ml-[14px] text-[#333]">
              商机品自动加入全球严选
              <Balloon.Tooltip
                trigger={<Icon type="help" className="ml-[4px] text-[#BBB]" />}
                align="tl"
                popupStyle={{ backgroundColor: '#333' }}
                style={{ width: '262px' }}
                popupClassName="products-business-tooltips"
              >
                <span className="text-[14px]">开启开关后，您的跨境商机品可以直接加入全球严选，无需手动操作报名。</span>
              </Balloon.Tooltip>
            </span>
          </div> */}
        </div>
        <div className="business-list">
          <Carousel className="w-full">
            <CarouselContent className="items-end">
              {
                data?.map((item, index) => {
                  return (
                    <CarouselItem
                      className="w-[280px] mt-[12px]"
                      key={item.strategyId}
                      data-report-primary-key={item?.strategyId}
                      data-report-attribute-exp={`1店铺商机卡片曝光@funnel_${item?.oppName}`}
                    >
                      <BusinessCard
                        // setFrom={setFrom}
                        index={index}
                        item={item}
                        handleCardSuccess={handleCardSuccess}
                        // updateBusinessFunc={updateBusinessFunc}
                      />
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
        </div>
      </div>
    </div>
  );
};

export default BusinessComp;
