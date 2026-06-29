import React from 'react';
import PropTypes from 'prop-types';

/**
 * 成功图标组件
 * @param {Object} props - 组件属性
 * @param {number} props.size - 图标大小，默认16
 * @param {string} props.color - 图标颜色，默认#3BB347
 * @param {string} props.className - 自定义CSS类名
 * @param {Object} props.style - 自定义样式
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {string} props.title - 图标标题，用于无障碍访问
 */
const SuccessIcon = ({
  size = 16,
  color = '#3BB347',
  className = '',
  style = {},
  onClick,
  title = '成功',
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
        d="M8,16C12.4183,16,16,12.4183,16,8C16,3.58172,12.4183,0,8,0C3.58172,0,0,3.58172,0,8C0,12.4183,3.58172,16,8,16ZM14.0859,5.59065Q14.5455,6.7515,14.5455,8Q14.5455,9.2485,14.0859,10.4093Q13.5869,11.6698,12.6283,12.6283Q11.6698,13.5869,10.4093,14.0859Q9.2485,14.5455,8,14.5455Q6.7515,14.5455,5.59065,14.0859Q4.33022,13.5869,3.37166,12.6283Q2.41311,11.6698,1.91411,10.4093Q1.45455,9.2485,1.45455,8Q1.45455,6.7515,1.91411,5.59065Q2.41311,4.33022,3.37166,3.37166Q4.33022,2.41311,5.59065,1.91411Q6.7515,1.45455,8,1.45455Q9.2485,1.45455,10.4093,1.91411Q11.6698,2.41311,12.6283,3.37166Q13.5869,4.33022,14.0859,5.59065ZM11.2204,5.50232L11.4284,5.71027C11.6556,5.93749,11.6556,6.30587,11.4284,6.53309L7.33182,10.6296C7.31602,10.6491,7.29907,10.6679,7.28098,10.686C6.99631,10.9706,6.53477,10.9706,6.2501,10.686L4.19303,8.6289C3.96581,8.40168,3.96581,8.0333,4.19303,7.80608L4.40109,7.59802C4.62831,7.37081,4.99669,7.37081,5.22391,7.59802L6.7629,9.13701L10.3976,5.50232C10.6248,5.2751,10.9932,5.2751,11.2204,5.50232Z"
        fillRule="evenodd"
        fill={color}
        fillOpacity="1"
      />
    </svg>
  );
};

SuccessIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  title: PropTypes.string,
};

export default SuccessIcon;