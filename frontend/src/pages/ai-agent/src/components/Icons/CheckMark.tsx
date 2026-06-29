import React from 'react';

type CheckMarkIconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  color?: string;
};

export const CheckMarkIcon: React.FC<CheckMarkIconProps> = ({
  size = 16,
  className,
  style,
  onClick,
  color = '#CCCCD4',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="currentColor"
      version="1.1"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
      style={style}
      onClick={onClick}
    >
      <defs>
        <clipPath id="master_svg0_642_87165">
          <rect x="0" y="0" width="12" height="12" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_642_87165)">
        <g>
          <path
            d="M10.85412,2.970030482421875L10.50996,2.6399034824218752C10.31529,2.453161982421875,9.99959,2.453348782421875,9.80516,2.640320482421875L4.57547,7.669239482421875L2.20244,5.392929482421875C2.00793,5.206349482421874,1.692572,5.206349482421874,1.4980660000000001,5.392929482421875L1.14588,5.730759482421875C0.9513731,5.917339482421875,0.9513731,6.219839482421875,1.14588,6.4064194824218745L4.225,9.360039482421875C4.41951,9.546609482421875,4.73487,9.546609482421875,4.9293700000000005,9.360039482421875L5.28156,9.022209482421875C5.30973,8.995179482421875,5.33382,8.965729482421875,5.35383,8.934549482421875L10.85454,3.6452794824218753C11.0486,3.458638482421875,11.0485,3.156449482421875,10.85412,2.970030482421875Z"
            fillRule="evenodd"
            fill={color}
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  );
};
