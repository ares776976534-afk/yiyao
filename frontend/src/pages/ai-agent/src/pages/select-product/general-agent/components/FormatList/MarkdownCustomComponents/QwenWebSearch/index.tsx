import React from 'react';
import renderContent from '../components/RenderContent';
import styles from './index.module.css';

const QwenWebSearch = ({ children, data, className, ...props }) => {
  const combinedClassName = className
    ? `qwen-web-search ${className}`
    : 'qwen-web-search';
  const _data = data.split(' || ');
  return _data.map((item) => (
    <a href={item} target="_blank" rel="noopener noreferrer" />
  ));
};

export default QwenWebSearch;

