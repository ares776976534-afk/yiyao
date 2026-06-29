import React from 'react';
import { Icon, Balloon } from '@alifd/next';
import '../index.scss';

export default function BalloonPrompt({
  trigger = <Icon type="help" className="text-[#BBB] cursor-pointer" />,
  align = 't',
  content = '通过此页面报名您的商品只会托管给跨境售卖',
  ...otherProps
}) {
  return (
    <Balloon.Tooltip
      trigger={trigger}
      align={align}
      triggerType="hover"
      popupStyle={{ backgroundColor: '#333', width: '244px', fontSize: '14px' }}
      popupClassName="products-business-tooltips"
      {...otherProps}
    >
      {content}
    </Balloon.Tooltip>
  );
}
