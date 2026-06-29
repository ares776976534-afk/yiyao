import React from 'react';
import type { IconProps } from './types';

const Number2Icon: React.FC<IconProps> = (props) => {
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
        <clipPath id="master_svg0_2_15363">
          <rect x="0" y="0" width="24" height="24" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_2_15363)">
        <g>
          <rect x="3" y="3" width="18" height="18" rx="9" fill="#6E50FF" fillOpacity="1" />
        </g>
        <g>
          <path
            d="M8.799,15.89L14.222000000000001,15.89L14.453,14.614L11.208,14.614C12.682,13.536,14.716999999999999,12.094999999999999,15.025,10.312999999999999C15.256,8.982,14.585,7.948,12.858,7.948C11.417,7.948,10.086,8.795,9.712,10.632L11.197,10.632C11.384,9.774000000000001,11.857,9.257,12.583,9.257C13.341999999999999,9.257,13.584,9.719,13.463000000000001,10.411999999999999C13.221,11.798,11.076,13.206,8.997,14.746L8.799,15.89Z"
            fill="#FFFFFF"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  );
};

export default Number2Icon;

