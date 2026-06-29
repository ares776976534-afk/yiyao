import React from 'react';

type CloseIconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export const UncheckedIcon: React.FC<CloseIconProps> = ({ size = 16, className, style, onClick }) => {
  return (
    <div
      className={className}
      style={{
        boxSizing: 'border-box',
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#FFF',
        // 黑色透明度/15%=#D9D9D9
        border: '1px solid rgba(0, 0, 0, 0.15)',
        ...style,
      }}
      onClick={onClick}
    />
  );
};

export const CheckedIcon: React.FC<CloseIconProps> = ({ size = 16, className, style, onClick }) => {
  return (
    <svg
      version="1.1"
      viewBox="0 0 16 16"
      width={size || 16}
      height={size || 16}
      color="var(--color-brand-1, #08cae0)"
      className={className}
      style={style}
      onClick={onClick}
    >
      <defs>
        <clipPath id="master_svg0_132_5126">
          <rect x="0" y="0" width="16" height="16" rx="8" />
        </clipPath>
        <clipPath id="master_svg1_132_5126/132_5116">
          <rect x="3" y="3" width="10" height="10" rx="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#master_svg0_132_5126)">
        <rect x="0" y="0" width="16" height="16" rx="8" fill="currentColor" />
        <g clipPath="url(#master_svg1_132_5126/132_5116)">
          <g>
            <path d="M12.045113505859375,5.47502474307251L11.758313505859375,5.19991874307251C11.596083505859376,5.0443015430725096,11.333003505859375,5.04445714307251,11.170973505859376,5.200266743072509L6.812903505859375,9.39102774307251L4.8353735058593745,7.49410774307251C4.673285505859375,7.33862774307251,4.4104865058593745,7.33862774307251,4.248398505859375,7.49410774307251L3.954910505859375,7.77562774307251C3.792821105859375,7.93111774307251,3.792821105859375,8.18319774307251,3.954910505859375,8.33868774307251L6.520843505859375,10.800027743072508C6.682933505859375,10.95550774307251,6.9457335058593745,10.95550774307251,7.1078235058593755,10.800027743072508L7.401313505859375,10.51850774307251C7.424783505859375,10.49598774307251,7.444853505859375,10.47144774307251,7.461533505859375,10.44545774307251L12.045463505859376,6.03773474307251C12.207213505859375,5.88219874307251,12.207063505859375,5.63037474307251,12.045113505859375,5.47502474307251Z"
              fillRule="evenodd"
              fill="#010101"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

