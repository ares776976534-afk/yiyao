import React from 'react';

const SUCCESS = 'success';
const WARNING = 'warning';
const DISABLED = 'disabled';
const INFO = 'info';

const styles = {
  [SUCCESS]: 'bg-[#25BE13]',
  [WARNING]: 'bg-[#FF7300]',
  [DISABLED]: 'bg-[#999999]',
  [INFO]: 'bg-[#0077FF]',
};

const normal = 'w-[4px] h-[4px]';
const large = 'w-[6px] h-[6px]';
const xxl = 'w-[8px] h-[8px]';

const sizeStyle = {
  normal,
  large,
  xxl,
};

export default (props) => {
  const { type = INFO, size = 'normal' } = props;
  const _style = styles[type];
  const _size = sizeStyle[size];

  return <div className={`${_size} rounded-full ${_style}`} />;
};
