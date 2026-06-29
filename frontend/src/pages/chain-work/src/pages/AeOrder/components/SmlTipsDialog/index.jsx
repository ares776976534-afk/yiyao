import React from 'react';
import { Dialog } from '@alifd/next';
import diorRequest from '@/service/diorRequest';
import './index.scss'

let dialog = null;

const getHasWaitToSendOrder = () => {
  return diorRequest('CDT_akkILw', 'hasWaitToSendOrder', {}).then((res) => {
    return res?.model === true;
  });
};

const Content = () => {
  dialog = Dialog.show({
    title: '尊敬的1688商家',
    width: '400px',
    className: 'ae-sml-tips-dialog',
    v2: true,
    content: (
      <div className="text-[14px] text-[#333]">
        根据速卖通平台发货时效要求，<span className="text-[#FF7300]">昨日14:00至今日14:00</span>产生的采购订单，须在<span className="text-[#FF7300]">今日15:00前</span>预约上门揽，并在<span className="text-[#FF7300]">今日24:00前</span>完成揽收。请您尽快发货。
      </div>
    ),
    footerActions: ['ok'],
    footerAlign: 'center',
    okProps: {
      children: '知道了',
    },
  });
};

export default () => {
  getHasWaitToSendOrder()
    .then((res) => {
      if (res) {
        Content();
      }
    });
};
