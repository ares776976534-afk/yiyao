import type { IconProps } from './types';

export default (props: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="none"
      version="1.1"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      {...props}
    >
      <defs>
        <clipPath id="master_svg0_2_30544/2_30476">
          <rect x="0" y="0" width="16" height="16" rx="8" />
        </clipPath>
        <clipPath id="master_svg1_2_30544/2_30479">
          <rect x="1" y="1" width="14" height="14" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_2_30544/2_30476)">
        <rect x="0" y="0" width="16" height="16" rx="8" fill="#FFFFFF" fillOpacity="1" />
        <g clipPath="url(#master_svg1_2_30544/2_30479)">
          <g>
            <path
              d="M5.375,8C5.375,8.48325,4.98325,8.875,4.5,8.875C4.016751,8.875,3.625,8.48325,3.625,8C3.625,7.516751,4.016751,7.125,4.5,7.125C4.98325,7.125,5.375,7.516751,5.375,8ZM8.875,8C8.875,8.48325,8.48325,8.875,8,8.875C7.51675,8.875,7.125,8.48325,7.125,8C7.125,7.516751,7.51675,7.125,8,7.125C8.48325,7.125,8.875,7.516751,8.875,8ZM12.375,8C12.375,8.48325,11.98325,8.875,11.5,8.875C11.01675,8.875,10.625,8.48325,10.625,8C10.625,7.516751,11.01675,7.125,11.5,7.125C11.98325,7.125,12.375,7.516751,12.375,8Z"
              fill="#FD963C"
              fillOpacity="1"
            />
          </g>
        </g>
        <rect
          x="0.5"
          y="0.5"
          width="15"
          height="15"
          rx="7.5"
          fillOpacity="0"
          strokeOpacity="1"
          stroke="#FD963C"
          fill="none"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};