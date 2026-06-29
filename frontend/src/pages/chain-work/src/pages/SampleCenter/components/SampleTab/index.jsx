import React from 'react';
import { Tab } from '@alifd/next';
import { ALL, SAMPLE_PENDING, SENT, QUALIFIED, UNQUALIFIED, INVALID } from '../../constant';
import './index.scss';

const tabs = [
  { tab: '全部', key: ALL },
  { tab: '待寄样', key: SAMPLE_PENDING },
  { tab: '已寄样', key: SENT },
  { tab: '验样合格', key: QUALIFIED },
  { tab: '验样失败', key: UNQUALIFIED },
  { tab: '已作废', key: INVALID },
];

function SampleTab(props) {
  const { status, setStatus } = props;
  return (
    <div className="tab-container">
      <Tab activeKey={status} onChange={(activeKey) => setStatus(activeKey)}>
        {tabs?.map((item) => (
          <Tab.Item key={item.key} title={item.tab} />
        ))}
      </Tab>
    </div>
  );
}

export default SampleTab;

