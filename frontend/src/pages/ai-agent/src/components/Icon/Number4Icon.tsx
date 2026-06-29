import React from 'react';
import type { IconProps } from './types';

const Number4Icon: React.FC<IconProps> = (props) => {
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
        <clipPath id="master_svg0_2_57062">
          <rect x="0" y="0" width="24" height="24" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_2_57062)">
        <g>
          <rect x="3" y="3" width="18" height="18" rx="9" fill="#6E50FF" fillOpacity="1" />
        </g>
        <g>
          <path
            d="M12.1705,16L13.6995,16L13.9855,14.438L14.9535,14.438L15.1845,13.096L14.2275,13.096L15.096499999999999,8.08L13.314499999999999,8.08L8.8045,13.228L8.5955,14.438L12.4455,14.438L12.1705,16ZM10.5315,13.096L13.3695,9.73L12.775500000000001,13.096L10.5315,13.096Z"
            fill="#FFFFFF"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  );
};

export default Number4Icon;

