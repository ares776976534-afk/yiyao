import React from 'react';
import styles from './index.module.css';

export const SpinningIcon = () => {
    return (
        <div className={styles.spinningIconWrapper}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                fill="none"
                version="1.1"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                className={styles.spinningIcon}
            >
                <defs>
                    <clipPath id="master_svg0_2_06566">
                        <rect x="0" y="0" width="18" height="18" rx="0" />
                    </clipPath>
                    <linearGradient
                        x1="0.8409388661384583"
                        y1="0"
                        x2="0.1251822263002396"
                        y2="0.9597952961921693"
                        id="master_svg1_2_03751"
                    >
                        <stop offset="0%" stopColor="#6150FF" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6150FF" stopOpacity="0.03999999910593033" />
                    </linearGradient>
                    <mask id="master_svg2_2_06566/2_03707" style={{ maskType: 'alpha' }} maskUnits="objectBoundingBox">
                        <g>
                            <path
                                d="M9,16.5C13.1421,16.5,16.5,13.1421,16.5,9C16.5,4.8578600000000005,13.1421,1.5,9,1.5C4.8578600000000005,1.5,1.5,4.8578600000000005,1.5,9C1.5,13.1421,4.8578600000000005,16.5,9,16.5ZM9,15C12.3137,15,15,12.3137,15,9C15,5.68629,12.3137,3,9,3C5.68629,3,3,5.68629,3,9C3,12.3137,5.68629,15,9,15Z"
                                fillRule="evenodd"
                                fill="#FFFFFF"
                                fillOpacity="1"
                            />
                        </g>
                    </mask>
                    <linearGradient
                        x1="0.14285576343536377"
                        y1="0.2688816487789154"
                        x2="0.14285576343536377"
                        y2="0.9243276715278625"
                        id="master_svg3_2_03737"
                    >
                        <stop offset="22.857142984867096%" stopColor="#6150FF" stopOpacity="0" />
                        <stop offset="100%" stopColor="#6150FF" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <g clipPath="url(#master_svg0_2_06566)">
                    <g mask="url(#master_svg2_2_06566/2_03707)">
                        <g style={{ opacity: 0.6809660196304321 }}>
                            <path
                                d="M9,16.5C13.1421,16.5,16.5,13.1421,16.5,9C16.5,4.8578600000000005,13.1421,1.5,9,1.5C4.8578600000000005,1.5,1.5,4.8578600000000005,1.5,9C1.5,13.1421,4.8578600000000005,16.5,9,16.5ZM9,15C12.3137,15,15,12.3137,15,9C15,5.68629,12.3137,3,9,3C5.68629,3,3,5.68629,3,9C3,12.3137,5.68629,15,9,15Z"
                                fillRule="evenodd"
                                fill="url(#master_svg1_2_03751)"
                                fillOpacity="1"
                            />
                        </g>
                        <g>
                            <path
                                d="M12.950140000000001,-4.415303051425L9.000084,14.454316796874998L8.981011,15.000216796875002C8.574325,15.010516796874999,8.25,15.343116796875002,8.25,15.749916796874999C8.25,16.136516796875,8.543873,16.459816796875,8.928729,16.496516796875L8.903461,17.219716796875L22.5032,14.435616796875L12.950140000000001,-4.415303051425Z"
                                fillRule="evenodd"
                                fill="url(#master_svg3_2_03737)"
                                fillOpacity="1"
                            />
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default SpinningIcon;

