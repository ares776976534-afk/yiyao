import type { IconProps } from './types';

const TransferIcon = (props: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="currentColor"
      version="1.1"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      {...props}
    >
      <defs>
        <clipPath id="newIcon_clip0">
          <rect x="0" y="0" width="16" height="16" rx="0" />
        </clipPath>
        <filter id="newIcon_dropShadow" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB" x="-0.16" y="-0.8461538461538461" width="1.32" height="2.8461538461538463">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="4" dx="0" />
          <feGaussianBlur stdDeviation="12" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03999999910593033 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
      <g clipPath="url(#newIcon_clip0)">
        <g>
          {/* 主要图形路径 */}
          <path
            d="M2 2h12v12H2V2zm1 1v10h10V3H3z"

            fillOpacity="1"
          />
          {/* 内部装饰元素 */}
          <circle cx="8" cy="8" r="2" fill="#6150FF" fillOpacity="1" />
          <path
            d="M6 6h4v4H6V6z"

            fillOpacity="0.1"
          />
        </g>
      </g>
    </svg>
  );
};

export default TransferIcon;
