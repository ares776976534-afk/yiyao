import React from 'react';
import styles from './index.module.css';
import { MagnifyIcon } from '@/components/Icon';
import log from '@/utils/log';

interface FrostedGlassProps {
    style?: React.CSSProperties;
    riskStatus?: string;
    imageUrl?: string;
    productUrl?: string;
    logKey?: string;
    logParams?: Record<string, any>;
}

const FrostedGlass: React.FC<FrostedGlassProps> = ({ style, riskStatus, imageUrl, productUrl, logKey, logParams }) => {
    const onClick = () => {
        if (productUrl) {
           // 如果提供了打点配置，先打点
           if (logKey) {
               log.record(logKey as `/${string}.${string}.${string}`, 'CLK', {
                   productUrl,
                   imageUrl,
                   ...logParams,
               });
           }
           window.open(productUrl, '_blank')
        }
    }
    return (
        <div
            className={`${styles.frostedGlass}
            ${riskStatus === 'risk' ? styles.riskStatus : ''}`}
            style={{ borderRadius: 4, cursor: productUrl ? 'pointer' : 'auto', ...style}}
        >
            <img 
                className={styles.frostedGlassImage} 
                src={imageUrl} 
                alt="img" 
                onClick={onClick}
            />
            {riskStatus === 'risk' && (<div className={styles.frostedOverlay} onClick={onClick} />)}
        </div>
    );
};

export default FrostedGlass;