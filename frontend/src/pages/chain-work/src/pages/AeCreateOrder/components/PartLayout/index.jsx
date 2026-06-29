import React from 'react';
import './index.scss';

export default (props) => {
  const { title, subTitle, children } = props;
  return (
    <div className="part-container">
      <div className="part-header">
        <div className="part-title">{title}</div>
        <div className="part-subTitle">{subTitle}</div>
      </div>
      <div>{children}</div>
    </div>
  );
};
