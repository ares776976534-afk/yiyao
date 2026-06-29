import React from 'react';
import RenderField from '@alife/1688-chain-renderfield';
import Table from './Table';
import Image from './Image';

export default ({ type, ...otherProps }) => {
  switch (type) {
    case 'table':
      return <Table {...otherProps} />;
    case 'image':
    case 'text':
      return <Image {...otherProps} />;
    default:
      return <RenderField type={type} {...otherProps} />;
  }
};
