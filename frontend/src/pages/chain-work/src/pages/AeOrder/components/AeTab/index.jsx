import React, { useState } from 'react';
import AeOrderList from '../AeOrderList';
import { SML, ZJ } from '../../constants';
import './index.scss';

export default () => {
  const [activeType, setActiveType] = useState(SML);
  // [2026-06-22 Offline] 产品要求下线商家自寄Tab，aeTabList仅保留上门揽
  const aeTabList = [
    {
      title: '上门揽订单',
      subTitle: '速卖通为您提供上门服务，不支持商家自行发货，不收取商家费用。',
      type: SML,
    },
    // [2026-06-22 Offline] 产品要求下线商家自寄Tab
    // {
    //   title: '商家自寄订单',
    //   subTitle: '商家须在限定时效内，自行联系快递公司进行发货。',
    //   type: ZJ,
    // },
  ];

  return (
    <div>
      {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab，仅剩一个Tab时隐藏Tab栏 */}
      {/* <div className="ae-tabs-container">
        {aeTabList.map((item) => {
          const { title, subTitle, type } = item;
          const isActive = activeType === type;

          return (
            <div
              className={`ae-tab-item ${isActive ? 'active' : ''}`}
              key={type}
              onClick={() => {
                setActiveType(type);
              }}
            >
              <div className="ae-tab-title">{title}</div>
              <div className="ae-sub-tab-title">{subTitle}</div>
            </div>
          );
        })}
      </div> */}
      <div>
        {activeType === SML && <AeOrderList activeType={activeType} />}
        {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab */}
        {/* {activeType === ZJ && <AeOrderList activeType={activeType} />} */}
      </div>
    </div>
  );
};
