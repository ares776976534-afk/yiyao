import React, { useState } from 'react';
import { Tab, Icon } from '@alifd/next';
import ItemTable from './ItemTable';
import BusinessTable from './BusinessTable';
import AeTab from './AeTab';
import { Logger, getResourceById } from '@/utlis';
import { AliwangwangOutlined } from '@ant-design/icons';

const tabMap = {
  order: '订单',
  item: '商品',
  business: '商机',
};
const dingTalkSend = () => {
  getResourceById(48064038)
    .then((res) => {
      res.forEach((item) => {
        if (item.link) {
          window.open(item.link, '_blank');
        }
      });
    });
  // window.open('https://qr.dingtalk.com/action/joingroup?code=v1,k1,eFNFqs6nUBzh7p9QgM6WbD5NdIJTqCMM7cK2dLBQo+g=&_dt_no_comment=1&origin=11?', '_blank');
};
function TableList() {
  const [activeKey, setActiveKey] = useState('order');
  const onChange = (key) => {
    Logger.report({ d: 'CLK', e: `3点击@funnel_${tabMap[key]}` });
    setActiveKey(key);
  };
  const extraContent = (
    <div className="flex items-center">
      <div className="text-[#333] text-[14px] flex items-center cursor-pointer mr-[12px]" onClick={dingTalkSend}>
        <AliwangwangOutlined style={{ color: '#07f', marginRight: '4px' }} />
        联系速卖通客服
      </div>
      <div className="text-[#333] text-[14px] flex items-center cursor-pointer" onClick={() => window.open('https://survey.1688.com/apps/zhiliao/x2lBgpe2S', '_blank')}>
        <Icon type="ic_FIle_Description_10px" style={{ color: '#07f', marginRight: '4px' }} />
        “速卖通优选”活动-咨询/退出
      </div>
    </div>
  );
  return (
    <Tab shape="wrapped" activeKey={activeKey} onChange={onChange} unmountInactiveTabs extra={extraContent} >
      <Tab.Item key="order" title="订单">
        <AeTab />
      </Tab.Item>
      <Tab.Item key="item" title="商品">
        <ItemTable />
      </Tab.Item>
      <Tab.Item key="business" title="商机">
        <BusinessTable />
      </Tab.Item>
    </Tab>
  );
}

export default TableList;
