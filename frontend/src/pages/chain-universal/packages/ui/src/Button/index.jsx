import React from 'react';
import { Button } from '@alifd/next';

import './index.scss';


const NEW_TYPE_CLASSNAME = {
  'primary-ghost': 'primary-ghost',
  'primary-small': 'primary-small',
};

export default ({ type = 'normal', children, ...otherProps }) => {
  const [originType = 'normal', newType] = type?.split(':');
  const newTypeClassname = NEW_TYPE_CLASSNAME[newType] || '';
  return (
    <Button type={originType} {...otherProps} className={`chain-ui-button ${newTypeClassname}`}>
      {children}
    </Button>
  );
};
