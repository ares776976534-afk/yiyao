import React from 'react';
import PropTypes from 'prop-types';

/**
 * 错误图标组件
 * @param {Object} props - 组件属性
 * @param {number} props.size - 图标大小，默认16
 * @param {string} props.color - 图标颜色，默认#FB3B20
 * @param {string} props.className - 自定义CSS类名
 * @param {Object} props.style - 自定义样式
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {string} props.title - 图标标题，用于无障碍访问
 */
const ErrorIcon = ({
  size = 16,
  color = '#FB3B20',
  className = '',
  style = {},
  onClick,
  title = '错误',
  ...restProps
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      role="img"
      aria-label={title}
      {...restProps}
    >
      <path
        d="M8,16C12.4183,16,16,12.4183,16,8C16,3.58172,12.4183,0,8,0C3.58172,0,0,3.58172,0,8C0,12.4183,3.58172,16,8,16ZM14.0859,5.59065Q14.5455,6.7515,14.5455,8Q14.5455,9.2485,14.0859,10.4093Q13.5869,11.6698,12.6283,12.6283Q11.6698,13.5869,10.4093,14.0859Q9.2485,14.5455,8,14.5455Q6.7515,14.5455,5.59065,14.0859Q4.33022,13.5869,3.37166,12.6283Q2.41311,11.6698,1.91411,10.4093Q1.45455,9.2485,1.45455,8Q1.45455,6.7515,1.91411,5.59065Q2.41311,4.33022,3.37166,3.37166Q4.33022,2.41311,5.59065,1.91411Q6.7515,1.45455,8,1.45455Q9.2485,1.45455,10.4093,1.91411Q11.6698,2.41311,12.6283,3.37166Q13.5869,4.33022,14.0859,5.59065ZM5.12089,4.83044L4.91518,5.03615C4.68797,5.26336,4.68751,5.63129,4.91415,5.85793L7.10941,8.05319L4.98283,10.1798C4.75618,10.4064,4.75664,10.7743,4.98386,11.0016L5.18956,11.2073C5.41678,11.4345,5.7847,11.4349,6.01135,11.2083L8.13793,9.08171L10.2645,11.2083C10.4912,11.4349,10.8591,11.4345,11.0863,11.2073L11.292,11.0016C11.5192,10.7743,11.5197,10.4064,11.293,10.1798L9.16645,8.05319L11.3617,5.85793C11.5884,5.63129,11.5879,5.26336,11.3607,5.03615L11.155,4.83044C10.9278,4.60323,10.5598,4.60277,10.3332,4.82941L8.13793,7.02467L5.94267,4.82941C5.71603,4.60277,5.3481,4.60323,5.12089,4.83044Z"
        fillRule="evenodd"
        fill={color}
        fillOpacity="1"
      />
    </svg>
  );
};

ErrorIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  title: PropTypes.string,
};

export default ErrorIcon;