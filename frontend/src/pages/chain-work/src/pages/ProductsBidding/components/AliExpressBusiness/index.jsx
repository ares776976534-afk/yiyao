import React, { useState, useEffect } from 'react';
import { Tab } from '@alifd/next';
import './index.scss';
import ToBeReportedContent from './ToBeReportedContent';
import MyReportedContent from './MyReportedContent';
import { batchQuerySellerType } from '@/pages/ProductsBidding/api';
import { sendLogger } from '@/pages/ProductsBidding/utils';

function AliExpressBusiness({ biddingActiveKey, onReceiveData, configurationData }) {
  const [activeKey, setActiveKey] = useState('subtab1');
  const [sellerTypeChecked, setSellerTypeChecked] = useState(false); // 协议checked
  useEffect(() => {
    if (biddingActiveKey === 'tab1') {
      setActiveKey('subtab1');
    }
    sendLogger('page_view');
  }, [biddingActiveKey]);

  const handleTanChange = (_key) => {
    setActiveKey(_key);
    sendLogger('page_view');
  };

  // 查询协议是否签署
  const fetchSellerType = async () => {
    try {
      const sellerTypeRes = await batchQuerySellerType('577987,5117313');
      setSellerTypeChecked(String(sellerTypeRes?.data?.data) === 'true');
    } catch (error) {
      setSellerTypeChecked(false);
    }
  };

  useEffect(() => {
    fetchSellerType();
  }, []);

  return (
    <div className="aeproducts-bidding-content">
      <Tab shape="capsule" onChange={(key) => handleTanChange(key)} activeKey={activeKey} defaultActiveKey={'subtab1'} unmountInactiveTabs>
        <Tab.Item title="待提报商机" key="subtab1">
          <div className="aepft-tabStyle">
            <ToBeReportedContent
              loadData={activeKey}
              handleTanChange={handleTanChange}
              biddingActiveKey={biddingActiveKey}
              onSendData={onReceiveData}
              configurationData={configurationData}
              sellerTypeChecked={sellerTypeChecked}
              setSellerTypeChecked={setSellerTypeChecked}
            />
          </div>
        </Tab.Item>
        <Tab.Item title="我的提报" key="subtab2">
          <div className="aemyr-tabStyle">
            <MyReportedContent
              loadData={activeKey}
              handleTanChange={handleTanChange}
              configurationData={configurationData}
              sellerTypeChecked={sellerTypeChecked}
              setSellerTypeChecked={setSellerTypeChecked}
            />
          </div>
        </Tab.Item>
      </Tab>
    </div>
  );
}

export default AliExpressBusiness;
