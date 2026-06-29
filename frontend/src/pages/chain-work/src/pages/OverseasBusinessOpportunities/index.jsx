import React, { useState, useEffect } from 'react';
import './index.scss';
import { Tab, Balloon, Icon } from '@alifd/next';
import { StoreOPP } from './StoreOPP';
import { NewOPP } from './NewOPP';
import { Record } from './Record';
import AoXiaBanner from '../CrossBorderOfferlist/components/AoXiaBanner';
import YxInfoDialog from '@/components/YxInfoDialog';
import { findSellerEntryDetail } from '@/components/YxInfoDialog/api';
import { wasYxDialogShownToday, setYxDialogShownToday, YX_DIALOG_FATIGUE_KEYS } from '@/components/YxInfoDialog/fatigue';

const YX_FATIGUE_KEY = YX_DIALOG_FATIGUE_KEYS.overseasBusinessOpportunities;
const { Tooltip } = Balloon;
const BusinessOpp = () => {
  const [activeKey, setActiveKey] = useState('QQYX_SHOP_ITEM');
  const [yxInfoDialogVisible, setYxInfoDialogVisible] = useState(false);

  useEffect(() => {
    // 解析 URL 上的 tab 参数，并在有效时设置激活的 Tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      const allowedKeys = new Set(['QQYX_SHOP_ITEM', 'QQYX_NEW_ITEM', 'RECORD']);
      if (tabFromUrl && allowedKeys.has(tabFromUrl)) {
        setActiveKey(tabFromUrl);
      }
    }

    // 跨境商机 严选弹窗（受疲劳度控制，一天最多弹一次）
    findSellerEntryDetail().then((res) => {
      if (res?.data?.status === 'active' && res?.data?.signStatus === 'active') {
        // 表示已经签约过 不弹
        setYxInfoDialogVisible(false);
      } else if (!wasYxDialogShownToday(YX_FATIGUE_KEY)) {
        setYxDialogShownToday(YX_FATIGUE_KEY);
        setYxInfoDialogVisible(true);
      } else {
        setYxInfoDialogVisible(false);
      }
    }).catch(() => {
      setYxInfoDialogVisible(false);
    });
  }, []);

  return (
    <div className="overseas-business-opportunities min-h-screen flex flex-col">
      <h1>跨境商机</h1>
      <AoXiaBanner />
      <div className="mt-[16px] flex-1 flex flex-col" >
        <Tab
          shape="wrapped"
          style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          unmountInactiveTabs
        >
          <Tab.Item title="店铺品商机" key="QQYX_SHOP_ITEM" >
            <StoreOPP />
          </Tab.Item>
          <Tab.Item
            title={
              <div className="flex items-center gap-[4px]">
                机会新品
                <Tooltip v2 trigger={<Icon type="ic_question" />} align="t" popupStyle={{ backgroundColor: '#333' }} popupClassName="products-business-tooltips">
                  <div className="text-[#fff] text-[14px] leading-[17px]">下游跨境电商平台高销量及趋势热点商品（相关数据由第三方提供，每天更新一次，下游价格按照中国银行汇率换算成人民币），及时报名捕捉跨境订单机会</div>
                </Tooltip>
              </div>
            }
            key="QQYX_NEW_ITEM"
          >
            <NewOPP />
          </Tab.Item>
          <Tab.Item title="商机报名记录" key="RECORD">
            <Record />
          </Tab.Item>
        </Tab>
      </div>

      {/* 严选弹窗 */}
      <YxInfoDialog
        visible={yxInfoDialogVisible}
        onClose={() => {
          setYxInfoDialogVisible(false);
        }}
      />
    </div>
  );
};

export default BusinessOpp;
