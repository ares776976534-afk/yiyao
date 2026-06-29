import React from 'react';

import './index.scss';

function SampleBasicLayout(props) {
  const { className, children } = props;
  const cls = className.split(' ').filter((item) => item !== 'basic-layout').join(' ');
  return (
    <div className={`sample-basic-layout ${cls}`}>
      {children}
    </div>
  );
}

export default SampleBasicLayout;
