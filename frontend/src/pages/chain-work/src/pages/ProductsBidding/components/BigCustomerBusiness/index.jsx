import React, { useState, useEffect } from 'react';
import { Tab } from '@alifd/next';
import './index.scss';
import ToBeReportedContent from './ToBeReportedContent';
import MyReportedContent from './MyReportedContent';
import { sendLogger } from '@/pages/ProductsBidding/utils';

function BigCustomerBusiness({ biddingActiveKey, onReceiveData }) {
  const [activeKey, setActiveKey] = useState('subtab3');

  const handleTanChange = (_key) => {
    setActiveKey(_key);
    sendLogger('page_view');
  };

  useEffect(() => {
    if (biddingActiveKey === 'tab2') {
      setActiveKey('subtab3');
    }

    sendLogger('page_view');
  }, [biddingActiveKey]);

  return (
    <div className="bcproducts-bidding-content">
      <Tab shape="capsule" onChange={(key) => handleTanChange(key)} activeKey={activeKey} defaultActiveKey={'subtab3'}>
        <Tab.Item title={'待提报商机'} key="subtab3">
          <div className="bcpft-tabStyle">
            <ToBeReportedContent
              loadData={activeKey}
              handleTanChange={handleTanChange}
              biddingActiveKey={biddingActiveKey}
              onSendData={onReceiveData}
            />
          </div>
        </Tab.Item>
        <Tab.Item title={'我的提报'} key="subtab4">
          <div className="bcmyr-tabStyle">
            <MyReportedContent
              loadData={activeKey}
              handleTanChange={handleTanChange}
              biddingActiveKey={biddingActiveKey}
            />
          </div>
        </Tab.Item>
      </Tab>
    </div>
  );
}

export default BigCustomerBusiness;
