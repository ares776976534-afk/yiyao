import React from 'react';
// 操作时间
const ACTION_TIME = {
  title: '操作时间',
  dataIndex: 'operateTime',
  cell: (value) => value || '-',
};

// 操作人
const ACTION_PERSON = {
  title: '操作人',
  dataIndex: 'operator',
  cell: (value) => value || '-',
};

// 操作事件
const ACTION_EVENT = {
  title: '操作事件',
  dataIndex: 'operateEvent',
  cell: (value) => value || '-',
};
const AddressDisplay = (v) => {
  return (
    <div>
      {Object.entries(v).map(([key, value]) => (
        <div key={key}>
          {key}：{value}
        </div>
      ))}
    </div>
  );
};
// 详情
const ACTION_DETAIL = {
  title: '详情',
  dataIndex: 'detail',
  cell: (value) => AddressDisplay(JSON.parse(value)),
};

export default () => {
  return [ACTION_TIME, ACTION_PERSON, ACTION_EVENT, ACTION_DETAIL];
};
