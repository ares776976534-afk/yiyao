import React from 'react';
import { Icon, Balloon } from '@alifd/next';

const { Tooltip } = Balloon;

function RenderHelpIcon(config) {
  const { value } = config;
  const intro = <Icon type="d-help" style={{ color: '#BBB' }} />;
  return (
    <Tooltip
      v2
      trigger={intro}
      align="t"
      arrowPointToCenter
      popupStyle={{ backgroundColor: '#333' }}
      popupClassName="products-business-tooltips"
    >
      {value}
    </Tooltip>
  );
}

export default RenderHelpIcon;
