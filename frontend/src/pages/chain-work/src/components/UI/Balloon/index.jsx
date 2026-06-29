import React from 'react';
import { Balloon, Icon } from '@alifd/next';


export default ({ children, balloonStyle = {}, popupClassName = '', triggeClassName = '', align = 'b' }) => {
  return (
    <Balloon
      align={align || 'b'}
      trigger={<Icon type="prompt" size="small" className={`text-[#BBB] ${triggeClassName}`} />}
      closable={false}
      popupClassName={`p-[12px] bg-[#fff] text-[#333] ${popupClassName}`}
      triggerType="hover"
      style={{ '--balloon-normal-color-bg': 'rgb(255 255 255)', ...balloonStyle }}
    >
      {children}
    </Balloon>
  );
};
