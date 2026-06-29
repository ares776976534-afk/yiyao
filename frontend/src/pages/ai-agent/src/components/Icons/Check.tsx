import React from "react";

type CheckIconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export const CheckIcon: React.FC<CheckIconProps> = (props) => {
  return (
    <div
      style={{
        backgroundColor: "#BBBDCA",
        width: 16,
        height: 16,
        borderRadius: 9.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        fill="currentColor"
        version="1.1"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        {...props}
      >
        <defs>
          <clipPath id="master_svg0_2_13272/2_04527">
            <rect x="0" y="0" width="14" height="14" rx="7" />
          </clipPath>
          <clipPath id="master_svg1_2_13272/2_04528">
            <rect x="2" y="2" width="10" height="10" rx="0" />
          </clipPath>
        </defs>
        <g clipPath="url(#master_svg0_2_13272/2_04527)">
          <rect
            x="0"
            y="0"
            width="14"
            height="14"
            rx="7"
            fill="#BBBDCA"
            fillOpacity="1"
          />
          <g clipPath="url(#master_svg1_2_13272/2_04528)">
            <g>
              <path
                d="M11.045103373069763,4.475024981491089L10.758303373069763,4.199918981491089C10.596073373069764,4.044301781491089,10.332993373069764,4.044457381491089,10.170963373069764,4.2002669814910885L5.812893373069763,8.391027981491089L3.835363373069763,6.494107981491089C3.673275373069763,6.338627981491089,3.410476373069763,6.338627981491089,3.2483883730697634,6.494107981491089L2.9549003730697634,6.775627981491089C2.7928109730697632,6.931117981491089,2.7928109730697632,7.183197981491089,2.9549003730697634,7.3386879814910895L5.520833373069763,9.800027981491088C5.682923373069763,9.955507981491088,5.945723373069763,9.955507981491088,6.107813373069764,9.800027981491088L6.401303373069763,9.518507981491089C6.424773373069764,9.495987981491089,6.444843373069763,9.471447981491089,6.461523373069763,9.445457981491089L11.045453373069764,5.037734981491089C11.207213373069763,4.882198981491089,11.207053373069764,4.630374981491089,11.045103373069763,4.475024981491089Z"
                fillRule="evenodd"
                fill="#FFFFFF"
                fillOpacity="1"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
