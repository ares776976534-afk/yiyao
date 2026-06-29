import React, { useEffect, useState } from 'react';
import { Balloon } from '@alifd/next';
import './index.scss';

const LeadBalloon = (props) => {
  const { title, trigger, align, childrenCell } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 此处接口请求标是否打上
    setVisible(true);
  }, []);

  if (!trigger) {
    return null;
  }

  return (
    <Balloon
      v2
      triggerType="focus"
      visible={visible}
      title={title || 'title in here'}
      trigger={trigger}
      align={align || 't'}
      className="lead-balloon"
      closable={false}
    >
      {childrenCell || 'wirte some in here'}
      <img
        className="close-icon"
        onClick={() => setVisible(false)}
        src="https://img.alicdn.com/imgextra/i1/O1CN01ut2GUT1DgiLwTP6pl_!!6000000000246-2-tps-200-200.png"
      />
    </Balloon>
  );
};

export default LeadBalloon;
