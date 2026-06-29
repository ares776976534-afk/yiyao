import React from 'react';

const SendBtn = (props) => {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" {...props}>
      <defs>
        <clipPath id="master_svg0_4_05183">
          <rect x="0" y="0" width="36" height="36" rx="18" />
        </clipPath>
        <clipPath id="master_svg1_4_05183/4_05182">
          <rect x="6" y="6" width="24" height="24" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_4_05183)">
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="18"
          fill="#D9D9D9"
          fillOpacity="1"
        />
        <g clipPath="url(#master_svg1_4_05183/4_05182)">
          <g>
            <path
              d="M18.9998596875,13.82843L18.9998596875,26L16.9998596875,26L16.9998596875,13.82843L11.6358996875,19.1924L10.2216796875,17.7782L17.9998596875,10L25.7780796875,17.7782L24.363879687500003,19.1924L18.9998596875,13.82843Z"
              fill="#FFFFFF"
              fillOpacity="1"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default SendBtn;
