import React from 'react';
import Block from '@/layouts/Block';
import Button from '@/components/UI/Button';

const getUrlParam = (key) => {
  const value =
    new URLSearchParams(location.search).get(key);

  return value || '';
};

function HeaderRender({
  alipay,
  registrationStatusType,
  rejectSummarize,
}) {
  return (
    <div className="mb-[16px]">
      {rejectSummarize && <div dangerouslySetInnerHTML={{ __html: rejectSummarize }} className="mb-[10px] px-[12px] py-[9px] bg-[#FFF2ED]" />}
      <Block
        title={<span className="text-[16px]">国内授权支付宝账号</span>}
        subTitle={
            getUrlParam('auth_code') || registrationStatusType === 'goRegister' || registrationStatusType === 'UNREGISTER_DRAFT' ? (
              <Button
                type="normal:primary-ghost"
                onClick={() => {
                  window.location.href = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021005112685789&scope=auth_user&redirect_uri=https://air.1688.com/app/channel-fe/chain-work/alipayinternationalaccountregistration.html';
                }}
              >
                更换账号
              </Button>
            ) : ''
          }
      >
        <div className="text-[14px]">
          <div className="py-[9px] px-[12px] text-[#666] bg-[#EBF6FF] rounded-[6px] mt-[12px]">
            {/* <div>受国家监管要求，商品销往海外需要商家注册支付宝国际账号。</div> */}
            <div>该账号需绑定国内支付宝账户，因此需公司或者法人的支付宝账号进行授权（优先使用公司支付宝；非公司或法人支付宝将导致审核失败）</div>
          </div>
          <div className="mt-[12px]">
            <span className="text-[#999]">账号昵称：</span>{alipay?.alipayNickName}
          </div>
          {/* <div className="mt-[10px]">
              <span className="text-[#999]">账号ID：</span>{alipay?.alipayUserId}
            </div> */}
        </div>
      </Block>
    </div>
  );
}

export default HeaderRender;
