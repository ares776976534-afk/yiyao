import React from 'react';
import { Balloon } from '@alifd/next';
import './ballonTooltip.scss';

function BallonTooltip({ trigger, content, align = 't', triggerType = 'hover', backgroundColor = '#333', popupClassName = 'products-business-tooltips' }) {
  return (
    <Balloon.Tooltip
      trigger={trigger}
      align={align}
      popupStyle={{ backgroundColor }}
      popupClassName={popupClassName}
      triggerType={triggerType}
    >
      {content}
    </Balloon.Tooltip>
  );
}

export default BallonTooltip;
