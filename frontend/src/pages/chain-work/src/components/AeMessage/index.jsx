import React from 'react';
import { Message } from '@alifd/next';
import './index.scss';

export default (props) => {
  return (
    <Message type="notice" className="ae-order-notice-message" {...props}>
      {props.children}
    </Message>
  );
};
