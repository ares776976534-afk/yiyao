import React from 'react';
import { Icon } from '@alifd/next';

import './index.scss';

const iconMap = {
  error: 'd-cancel',
  success: 'ic_success',
};

export default ({ type, size, style }) => {
  const iconType = iconMap[type] || type;
  return <Icon type={iconType} size={size} style={style} />;
};
