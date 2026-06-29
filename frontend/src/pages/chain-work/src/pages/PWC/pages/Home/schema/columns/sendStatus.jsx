import React from 'react';
import { Button } from '@alifd/next';
import StatusDot from '@/components/StatusDot';
import { STATUS_TEXT_MAP, STATUS_TYPE, STATUS_DESTROYED, STATUS_UNPAY, STATUS_PAID, STATUS_REFUSED, STATUS_SEND } from '@/pages/PWC/constants';

const DEAL_TYPE_MAP = {
  RETURN: '退回',
  DESTROY: '销毁',
  REFUSED: '拒收',
};

const WlNum = ({ data }) => {
  return data ? (
    <p className="flex flex-row items-center text-[13px] mb-[4px] text-[#666]">物流单号：{data}</p>
  ) : null;
};

const PayLogicFee = () => {
  return (
    <>
      {/* <Button text type="primary" className="!text-[13px] ml-[6px]" >支付运费</Button> */}
      <span className="text-[13px] ml-[6px] text-[#333]">运费支付成功</span>
    </>
  );
};

const ResolveWay = ({ data = {} }) => {
  const { dealType, returnExpressNumber } = data;
  return dealType ? (
    <div className="flex flex-col text-[#999]">
      <p className="flex flex-row items-center text-[13px] mb-[4px]">
        处理方式：{DEAL_TYPE_MAP[dealType] || '-'}
        {/* <PayLogicFee /> */}
      </p>
      <WlNum data={returnExpressNumber} />
    </div>
  ) : null;
};


export default (value, index, record) => {
  const { sendSampleStatusExtInfo = {} } = record;
  const { sendExpressNumber } = sendSampleStatusExtInfo;
  const text = STATUS_TEXT_MAP[value];
  const type = STATUS_TYPE[value];
  const isHandle = [STATUS_DESTROYED, STATUS_UNPAY, STATUS_PAID, STATUS_REFUSED].indexOf(value) > -1;
  const isSend = value === STATUS_SEND;
  return (
    <div>
      <div className="flex flex-row items-center h-[18px] mb-[4px]">
        <StatusDot type={type} />
        <span className="ml-[4px] text-[#333] text-[13px]">{text}</span>
      </div>
      {
        isSend ? (<WlNum data={sendExpressNumber} />) : null
      }
      {
        isHandle ? (
          <div>
            <ResolveWay data={sendSampleStatusExtInfo} />
          </div>
        ) : null
      }
    </div>
  );
};

