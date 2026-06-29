import React from 'react';
import type { IconProps } from './types';

const Number1Icon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="none"
      version="1.1"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style={{ flexShrink: 0 }}
      {...props}
    >
      <defs>
        <clipPath id="master_svg0_2_22385">
          <rect x="0" y="0" width="24" height="24" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_2_22385)">
        <g>
          <rect x="3" y="3" width="18" height="18" rx="9" fill="#6E50FF" fillOpacity="1" />
        </g>
        <g>
          <path
            d="M10.9,16L12.484,16L13.870000000000001,8.19L11.23,8.19L10.966,9.620000000000001L12.022,9.620000000001L10.9,16Z"
            fill="#FFFFFF"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  );
};

export default Number1Icon;

