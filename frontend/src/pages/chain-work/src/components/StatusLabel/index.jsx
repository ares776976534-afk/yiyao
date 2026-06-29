import React from 'react';
import StatusDot from '../StatusDot';

const SUCCESS = 'success';
const WARNING = 'warning';
const DISABLED = 'disabled';
const INFO = 'info';

const styles = {
  [SUCCESS]: 'bg-[#E7F8E5]',
  [WARNING]: 'bg-[#FFEFE5]',
  [DISABLED]: 'bg-[#999999]',
  [INFO]: 'bg-[#E6F2FF]',
};


export default (props) => {
  const { type = INFO, children } = props;
  const _style = styles[type];
  return (
    <div className={`px-[8px] py-[5px] rounded-[30px] flex flex-row items-center justify-center ${_style}`}>
      <StatusDot type={type} size="large" />
      <span className="ml-[4px] text-[14px] h-[14px] text-[#333] flex items-center">
        {children}
      </span>
    </div>
  );
};
