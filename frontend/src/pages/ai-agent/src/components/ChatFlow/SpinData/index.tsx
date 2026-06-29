import React from 'react';
import { Spin } from 'antd';
import { imgIcon } from '../imgIcon';
import style from './index.module.css';

interface SpinDataProps {
    text?: string;
    spinning?: boolean;
    direction?: 'left' | 'right';
}

const SpinData: React.FC<SpinDataProps> = ({ spinning, text, direction }) => {
    const spinComponent = (
        <Spin
            spinning={spinning}
            indicator={<img src={imgIcon[6]} className={style.loadingSpin} />}
        />
    );

    return (
        <div className={style.differenceCardContent}>
            {direction === 'left' && spinComponent}
            <div className={style.differenceCardContentText}>{text}</div>
            {direction === 'right' && spinComponent}
        </div>
    );
};

export default SpinData;