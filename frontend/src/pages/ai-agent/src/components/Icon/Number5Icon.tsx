import React from 'react';
import type { IconProps } from './types';

const Number5Icon: React.FC<IconProps> = (props) => {
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
        <clipPath id="master_svg0_2_15716">
          <rect x="0" y="0" width="24" height="24" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_2_15716)">
        <g>
          <rect x="3" y="3" width="18" height="18" rx="9" fill="#6E50FF" fillOpacity="1" />
        </g>
        <g>
          <path
            d="M10.306000000000001,7.959L9.481,12.667L10.966000000000001,12.667C11.208,12.172,11.681000000000001,11.82,12.318999999999999,11.82C13.187999999999999,11.82,13.551,12.315000000000001,13.397,13.216999999999999C13.243,14.064,12.725999999999999,14.702,11.813,14.702C11.076,14.702,10.690999999999999,14.295,10.669,13.734L9.161999999999999,13.734C9.063,15.043,9.888,16,11.604,16C13.43,16,14.585,14.834,14.871,13.195C15.102,11.952,14.706,10.544,12.836,10.544C12.165,10.544,11.516,10.83,11.164,11.193L11.494,9.312L15.058,9.312L15.289,7.959L10.306000000000001,7.959Z"
            fill="#FFFFFF"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  );
};

export default Number5Icon;

