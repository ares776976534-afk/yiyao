import type { IconProps } from './types';

export default (props: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      fill='none'
      version='1.1'
      width='12'
      height='12'
      viewBox='0 0 12 12'
      {...props}
    >
      <g transform='matrix(1,0,0,-1,0,24)'>
        <g>
          <path
            d='M6.8,15.06667L10.8,20.4C11.2944,21.05924,10.824,22,10,22L2,22C1.17595,22,0.705573,21.05924,1.2,20.4L5.2,15.06667C5.6,14.533333,6.4,14.533333,6.8,15.06667'
            fill={props.fill || 'currentColor'}
            fillOpacity='1'
          />
        </g>
      </g>
    </svg>
  );
};