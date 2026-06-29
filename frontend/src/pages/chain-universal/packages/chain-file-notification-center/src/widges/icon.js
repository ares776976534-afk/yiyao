import React from 'react';
import '../style/iconfont';
import styled from 'styled-components';
import { Icon } from '@alifd/next';

const IconImg = ({ icon, onClick = () => {}, size='xl' }) => (
  <Icon onClick={onClick} className={`icon ${icon}`} aria-hidden="true" type={icon} size={size} >
  </Icon>
);

const SVG = styled.svg`
  height: 32px;
  width: 32px;
`;

export default IconImg;
