import React from 'react';

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

const textStyle = {
  [SUCCESS]: 'text-[#3BB347]',
  [WARNING]: 'text-[#FB3B20]',
  [DISABLED]: 'text-[#333]',
  [INFO]: 'text-[#0077FF]',
};


export default (props) => {
  const { type = INFO, children } = props;
  const _style = styles[type];
  const _textStyle = textStyle[type];
  return (
    <div className={`px-[4px] py-[1px] rounded-[10px] flex flex-row items-center justify-center ${_style}`}>
      <span className={`text-[12px] flex items-center ${_textStyle}`}>
        {children}
      </span>
    </div>
  );
};
