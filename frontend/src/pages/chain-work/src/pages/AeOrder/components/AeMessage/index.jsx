import React from 'react';
import AeMessage from '@/components/AeMessage';

export default () => {
  return (
    <AeMessage>
      速卖通订单只展示近三个月订单；对于三个月以前的订单，可前往“
      <a className="link" href="https://work.1688.com/?_path_=gonghuotuoguan/2017sellerbase_trade/saleList" target="_blank" rel="noreferrer">
        已卖出的货品
      </a>
      ”进行查看。
    </AeMessage>
  );
};
