import React from 'react';

type StarBadgeIconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export const StarBadgeIcon: React.FC<StarBadgeIconProps> = ({ size = 20, className, style, onClick }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="none"
      version="1.1"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      style={style}
      onClick={onClick}
    >
      <g>
        <g>
          <path
            d="M1.875,11.875L5.53536,13.167259999999999C5.91699,13.30199,6.20978,13.61316,6.32105,14.00228L7.5,18.125L8.67895,14.00228C8.79022,13.61316,9.08301,13.30199,9.46464,13.167259999999999L13.125,11.875L9.46464,10.582740000000001C9.08301,10.44801,8.79022,10.13684,8.67895,9.747720000000001L7.5,5.625L6.32105,9.747720000000001C6.20978,10.13684,5.91699,10.44801,5.53536,10.582740000000001L1.875,11.875Z"
            fill="#1B1C1D"
            fillOpacity="1"
          />
        </g>
        <g>
          <path
            d="M11.25,6.25L13.62149,7.15421L14.375,10L15.12851,7.15421L17.5,6.25L15.12851,5.34579L14.375,2.5L13.62149,5.34579L11.25,6.25Z"
            fill="#6E50FF"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  );
};

