import React, { useState, useEffect } from 'react';
import Button from '@/components/UI/Button';
import { Balloon, Loading } from '@alifd/next';
import { Logger } from '@/utlis';
import aiRobot, { aiRobotSwitch } from '@/libs/alipayRobotSdk';

function onUrl() {
  window.open('https://air.1688.com/app/channel-fe/chain-work/alipayinternationalaccountregistration.html', '_blank');
}
const type = {
  UNREGISTER: {
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01iWdkRO25KGI433Uin_!!6000000007507-2-tps-16-15.png',
    text: '请完成注册申请，否则商品无法销售至境外。',
    btnText: '去注册',
    btnStaus: 'UNREGISTER',
    status: '未注册',
    bg: 'bg-[#FFF9EB]',
  },
  UNREGISTER_DRAFT: {
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01iWdkRO25KGI433Uin_!!6000000007507-2-tps-16-15.png',
    text: '请完成注册申请，否则商品无法销售至境外。',
    btnText: '去注册',
    btnStaus: 'UNREGISTER_DRAFT',
    status: '未注册',
    bg: 'bg-[#FFF9EB]',
  },
  UNDER_REVIEW: {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01Tn8wje1ov2d9pO62z_!!6000000005286-2-tps-16-16.png',
    text: '您的申请信息正在审核中，请等待，您可以查看已提交信息。',
    btnText: '查看',
    btnStaus: 'UNDER_REVIEW',
    status: '审核中',
    bg: 'bg-[#EBF6FF]',
  },
  CDD_REJECT: {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png',
    text: '您的申请信息审核未通过，请点击下方按钮去修改。',
    btnText: '去修改',
    btnStaus: 'CDD_REJECT',
    status: '注册驳回',
    bg: 'bg-[#FFF2ED]',
  },
  EDD_REJECT: {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png',
    text: '您的申请信息审核未通过，请点击下方按钮去补充。',
    btnText: '去补充',
    btnStaus: 'EDD_REJECT',
    status: '注册驳回',
    bg: 'bg-[#FFF2ED]',
  },
  REGISTER_REJECT: {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png',
    text: '由于风控原因，您的申请审核未通过。',
    btnText: '查看',
    btnStaus: 'REGISTER_REJECT',
    status: '注册拒绝',
    bg: 'bg-[#FFF2ED]',
  },
};

function AlipayInternationalAccount({ modelData, loading }) {
  const [switchAiRobot, setSwitchAiRobot] = useState(false);
  const { registrationStatus = '', companyName = '', globalAlipayUserId = '', alipayLoginUrl = '' } = modelData;
  const onBtn = () => {
    switch (type[registrationStatus]?.btnStaus) {
      case 'UNREGISTER':
      case 'UNREGISTER_DRAFT':
        Logger.report({ d: 'CLK', e: '2去注册点击@funnel_国际账号' });
        window.open('https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021005112685789&scope=auth_user&redirect_uri=https://air.1688.com/app/channel-fe/chain-work/alipayinternationalaccountregistration.html', '_blank');
        return;
      default:
        return onUrl();
    }
  };

  const handleOpenAlipayRobot = async () => {
    aiRobot().madaOpen();
  };

  useEffect(() => {
    aiRobotSwitch()
      .then((res) => {
        setSwitchAiRobot(res);
      });
  }, []);

  return (
    <div className="p-[16px] bg-[#FFF] rounded-[6px] flex-1 text-[14px]">
      <div className="flex flex-row justify-between items-center mb-[12px]">
        <span className="text-[16px] font-[500] text-[#333] leading-[19px]">支付宝国际账号</span>
        {switchAiRobot && <span className="text-[14px] text-[#0077FF] cursor-pointer" onClick={handleOpenAlipayRobot}>咨询支付宝客服</span>}
      </div>
      <Loading tip="加载中..." visible={loading}>
        {registrationStatus ? (
          <div>
            {type[registrationStatus] && (
              <div>
                <div className={`py-[9px] px-[12px] flex ${type[registrationStatus]?.bg} rounded-[6px]`}>
                  <img className="w-[16px] h-[16px] mt-[3px]" src={type[registrationStatus]?.icon} alt="" />
                  <div className="ml-[8px] text-[#666]">{type[registrationStatus]?.text}</div>
                </div>
                <div className="mt-[12px]">
                  <span className="text-[#999]">注册状态：</span>
                  <span className="text-[#000]">{type[registrationStatus]?.status}</span>
                  <Button
                    style={{ height: '24px', marginLeft: '8px' }}
                    type="normal:primary-ghost"
                    onClick={onBtn}
                    data-report-primary-key="itemId"
                    data-report-attribute-exp={type[registrationStatus]?.btnStaus === 'goRegister' && '1去注册曝光@funnel_国际账号'}
                  >
                    {type[registrationStatus]?.btnText}
                  </Button>
                </div>
              </div>
            )}
            {registrationStatus === 'REGISTER_SUCCESS' && (
              <div>
                <div>
                  <div className="leading-[16px]">
                    <span className="text-[#999]">账号ID：</span>
                    <span className="text-[#000]">{globalAlipayUserId}</span>
                  </div>
                  <div className="mt-[8px] leading-[16px] flex">
                    <span className="text-[#999]">公司名称：</span>
                    {companyName?.length < 14 ? (
                      <div className="w-[198px] text-[#000] text-ellipsis line-clamp-1">{companyName}</div>
                    ) : (
                      <Balloon.Tooltip
                        trigger={<div className="w-[198px] text-[#000] text-ellipsis line-clamp-1 cursor-pointer">{companyName}</div>}
                        align="t"
                        popupStyle={{ backgroundColor: '#333' }}
                        popupClassName="products-business-tooltips"
                      >
                        {companyName}
                      </Balloon.Tooltip>
                    )}
                  </div>
                  <div className="mt-[8px] leading-[16px]">
                    <span className="text-[#999]">注册状态：</span>
                    <span className="text-[#000]">注册成功</span>
                  </div>
                </div>
                <div className="mt-[8px] flex justify-end">
                  {alipayLoginUrl && (
                    <Button
                      style={{ height: '24px', marginLeft: '8px' }}
                      type="normal:primary-ghost"
                      onClick={() => window.open(alipayLoginUrl, '_blank')}
                    >
                      查看账号信息
                    </Button>
                  )}
                  <Button
                    style={{ height: '24px', marginLeft: '8px' }}
                    type="normal:primary-ghost"
                    onClick={() => { onUrl(); }}
                  >
                    查看注册信息
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[#999] flex justify-center items-center h-[92px] w-[268px]">信息查询中...</div>
        )}
      </Loading>
    </div>
  );
}

export default AlipayInternationalAccount;
