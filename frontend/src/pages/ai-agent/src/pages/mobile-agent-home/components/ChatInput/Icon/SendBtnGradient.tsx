import React from 'react';

function SendBtnGradient(props) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      {...props}
    // className={`${className || ""} gradient-send-icon`}
    >
      <defs>
        <linearGradient
          x1="0.1279076486825943"
          y1="0.0548434779047966"
          x2="0.92822265625"
          y2="1.0633138418197632"
          id="master_svg0_150_373175"
        >
          <stop offset="0%" stopColor="#6E50FF" stopOpacity="1" />
          <stop
            offset="95.71428298950195%"
            stopColor="#C9ADFF"
            stopOpacity="1"
          />
        </linearGradient>
        <clipPath id="master_svg1_183_30855/183_22022">
          <rect x="0" y="0" width="36" height="36" rx="18" />
        </clipPath>
        <clipPath id="master_svg2_183_30855/183_22022/183_22017">
          <rect x="6" y="6" width="24" height="24" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg1_183_30855/183_22022)">
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="18"
          fill={`url(#master_svg0_150_373175)`}
          fillOpacity="1"
        />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="18"
          fill="rgba(255, 255, 255, 0.2)"
          fillOpacity="0"
          className="hover-overlay"
          style={{ transition: "fillOpacity 0.2s ease" }}
        />
        <g clipPath="url(#master_svg2_183_30855/183_22022/183_22017)">
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
}

export default SendBtnGradient;
