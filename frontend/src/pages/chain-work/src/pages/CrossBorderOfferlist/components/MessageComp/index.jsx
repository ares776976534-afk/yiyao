import React, { useState, useEffect } from 'react';
import { Message } from '@alifd/next';
import './index.scss';

const MOCK_URL = 'https://www.1688.com/';
const MessageComp = () => {
  return (
    <div className="message-comp">
      <Message type="notice" >
        1688跨境货通全球，助力商家实现一品卖全球！跨境出海，全新市场，势在必行，
        <a href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb?spm=a26eo.28269322.lj2jcumz.12.4c8c3530jrwXwu" target="_blank">点击了解详情&gt;&gt;&gt;</a>
      </Message>
    </div>
  );
};

export default MessageComp;
