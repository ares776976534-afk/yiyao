import React, { useState, useCallback } from 'react';
import './index.scss';
import { Tab } from '@alifd/next';
import AliExpressBusiness from '../AliExpressBusiness';
import BigCustomerBusiness from '../BigCustomerBusiness';

const ProductsBiddingTab = ({
  aeSuccessData,
  bcSuccessData,
  setAeBusinessData,
  setBcBusinessData,
  initialTab,
  configurationData,
}) => {
  const [biddingActiveKey, setBiddingActiveKey] = useState(initialTab);

  const handleDataFromAE = useCallback(
    (data) => {
      setAeBusinessData(data);
    },
    [setAeBusinessData],
  );

  const handleDataFromBC = useCallback(
    (data) => {
      setBcBusinessData(data);
    },
    [setBcBusinessData],
  );
  const renderTabTitle = (title, count) => {
    let badgeContent;
    if (count > 99) {
      badgeContent = '99+';
    } else {
      badgeContent = count?.toString();
    }
    const shouldShowBadge = count > 0; // 当count大于0时，显示徽标
    return (
      <>
        {title}
        {shouldShowBadge && (
          <span className="badge-container">
            <span className="badge-count">
              <span className="badge-badgeContent">{badgeContent}</span>
            </span>
          </span>
        )}
      </>
    );
  };

  const handleTanChange = useCallback((_key) => {
    setBiddingActiveKey(_key);
  }, []);

  return (
    <div className="products-bidding-content">
      <Tab onChange={(key) => handleTanChange(key)} defaultActiveKey={initialTab}>
        <Tab.Item title={renderTabTitle('速卖通商机', aeSuccessData?.total)} key="tab1">
          <div className="pft-tabStyle">
            <AliExpressBusiness
              biddingActiveKey={biddingActiveKey}
              onReceiveData={handleDataFromAE}
              configurationData={configurationData}
            />
          </div>
        </Tab.Item>
        {/* <Tab.Item title={renderTabTitle('大客商机', bcSuccessData?.total)} key="tab2">
          <div className="myr-tabStyle">
            <BigCustomerBusiness biddingActiveKey={biddingActiveKey} onReceiveData={handleDataFromBC} />
          </div>
        </Tab.Item> */}
      </Tab>
    </div>
  );
};

export default ProductsBiddingTab;
