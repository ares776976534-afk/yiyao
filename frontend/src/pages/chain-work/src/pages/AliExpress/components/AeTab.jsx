import React, { useState } from 'react';
import AeOrderList from './AeOrderList';
import { SML, ZJ, defaultParam } from '@/pages/AeOrder/constants';
import { Divider } from '@alifd/next';
import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';
import AeSearchFilter from '@/pages/AeOrder/components/AeSearchFilter';
import './aeTab.scss';

export default () => {
  const [activeType, setActiveType] = useState(SML);
  const [params, setParams] = useState(defaultParam);
  const [pageNo, setPageNo] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // [2026-06-22 Offline] 产品要求下线商家自寄Tab，aeTabList仅保留上门揽
  const aeTabList = [
    {
      title: '上门揽订单',
      tip: '速卖通为您提供上门服务，不支持商家自行发货，不收取商家费用。',
      type: SML,
    },
    // [2026-06-22 Offline] 产品要求下线商家自寄Tab
    // {
    //   title: '商家自寄订单',
    //   tip: '商家须在限定时效内，自行联系快递公司进行发货。',
    //   type: ZJ,
    // },
  ];
  const hanldeSetParams = (_params) => {
    setParams(_params);
    setPageNo(1);
    setSelectedRowKeys([]);
  };
  const onSelectedRowKeys = (key) => {
    setSelectedRowKeys(key);
  };
  return (
    <div>
      <div className="px-[20px] py-[16px] bg-[#fff] mb-[16px] rounded-[6px] ae-order-tab">
        {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab，仅剩一个Tab时隐藏Tab栏 */}
        {/* <div className="flex items-center mb-[20px] h-[20px]">
          {aeTabList?.map((item, index) => {
            const { title, tip, type } = item;
            const isActive = activeType === type;
            return (
              <div key={type} >
                <span
                  className={`mr-[8px] text-[14px] leading-[17px] cursor-pointer ${isActive ? 'text-[#0077FF] font-medium' : 'text-[#666]'}`}
                  onClick={() => {
                    setActiveType(type);
                    hanldeSetParams(defaultParam);
                  }}
                >
                  {title}
                </span>
                {tip && <BalloonPrompt content={tip} />}
                {index !== aeTabList.length - 1 && <Divider direction="ver" className="h-[16px] mx-[16px]" />}
              </div>
            );
          })}
        </div> */}
        {activeType === SML && <AeSearchFilter setParams={hanldeSetParams} type={activeType} />}
        {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab */}
        {/* {activeType === ZJ && <AeSearchFilter setParams={hanldeSetParams} type={activeType} />} */}
      </div>
      <AeOrderList
        activeType={activeType}
        params={params}
        pageNo={pageNo}
        setPageNo={setPageNo}
        selectedRowKeys={selectedRowKeys}
        onSelectedRowKeys={onSelectedRowKeys}
      />
    </div>
  );
};
