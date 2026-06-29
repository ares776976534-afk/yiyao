import React from 'react';
import PropTypes from 'prop-types';
import { ReturnRefundIcon, TopOutIcon, DiscountOfferIcon, RedEnvelopeIcon } from '../Icon';
import Button from '@/components/UI/Button';

const data = [
  {
    title: '0门槛入驻',
    desc: '0成本开店，免费入驻海外仓业务。',
    icon: <ReturnRefundIcon />,
  },
  {
    title: '流量扶持',
    desc: '享受海外仓商品专属标签和平台额外流量扶持。',
    icon: <TopOutIcon />,
  },
  {
    title: '交易佣金减免',
    desc: '原交易佣金为5%，2026年9月30日前减免为0.6%。',
    icon: <DiscountOfferIcon />,
  },
  {
    title: '营销支持',
    desc: '优先做站外/渠道推广，并在营销活动时优先享有平台补贴。',
    icon: <RedEnvelopeIcon />,
  },
];

const reviewStatusMap = {
  UNREGISTER: '立即申请',
  UNREGISTER_DRAFT: '继续申请',
  UNDER_REVIEW: '审核中',
  REJECT: '重新申请',
};

const EntryTemplate = ({ reviewStatus = 'UNREGISTER' }) => {
  function navigateWithQueryParams() {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/overseaswarehouseresidenceapplication.html`, '_blank');
  }
  const onClick = () => {
    navigateWithQueryParams();
  };
  return (
    <div className="flex flex-col p-[24px_20px_20px_20px] gap-[20px] rounded-[6px] bg-[#fff]">
      <div className="flex flex-col gap-[8px] items-center">
        <div className="text-[16px] font-medium leading-[19px] text-[#333]">开启海外仓业务，拓展全球市场</div>
        <div className="text-[14px] font-normal leading-[22px] text-[#666] flex items-center">
          <span className="mr-[4px]">立即申请海外仓服务，享受平台流量扶持，降低物流成本，提升用户体验。</span>
          <div
            className="text-[#07f] cursor-pointer text-[13px]"
            onClick={() => {
              window.open('https://qr.dingtalk.com/action/joingroup?code=v1,k1,GJvKXhYGULa/epzAbyLkYsXsn2wf710V91G4oeA/x4Q=&_dt_no_comment=1&origin=11?', '_blank');
            }}
          >
            了解详情
          </div>
        </div>
      </div>
      <div className="flex gap-[16px]">
        {data.map((item) => (
          <div key={item.title} className="min-w-[220px] flex items-center p-[20px] gap-[16px] flex-1 bg-[#F5FAFF] rounded-[6px]">
            <div className="w-[40px] h-[40px] flex items-center justify-center p-[12px_8px] rounded-[6px] bg-[#fff]">
              {item.icon}
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="text-[14px] font-medium leading-[17px] text-[#333]">{item.title}</div>
              <div className="text-[12px] font-normal leading-[19px] text-[#999]">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-[20px] justify-center items-center">
        <Button type="primary" style={{ height: '40px', borderRadius: '6px' }} disabled={reviewStatus === 'UNDER_REVIEW'} onClick={onClick}>{reviewStatusMap[reviewStatus]}</Button>
        {reviewStatus === 'UNDER_REVIEW' && <Button type="primary" text onClick={onClick}>查看申请</Button>}
      </div>
    </div>
  );
};

EntryTemplate.propTypes = {
  reviewStatus: PropTypes.oneOf(['UNREGISTER', 'UNREGISTER_DRAFT', 'UNDER_REVIEW', 'REJECT']),
};

export default EntryTemplate;
