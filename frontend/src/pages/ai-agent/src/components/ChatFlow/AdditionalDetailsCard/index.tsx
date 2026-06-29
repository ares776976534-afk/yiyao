import React from 'react';
import style from './index.module.css';
import { $t } from '@/i18n';

interface AdditionalDetailsCardProps {
    content?: React.ReactNode;
    size?: { width: number; height: number };
    moreText?: string;
    onMoreClick?: () => void;
}

const AdditionalDetailsCard: React.FC<AdditionalDetailsCardProps> = ({
    content = '', size, moreText = $t("global-1688-ai-app.ChatFlow.AdditionalDetailsCard.viewDetails", "查看详情"), onMoreClick = () => { } }) => {
    return (
        <div
            className={style.additionalDetailsCard}
            style={{ width: size?.width, height: size?.height }}
            onClick={onMoreClick}
        >
            {content}
            <span>{moreText}</span>
            <img className={style.additionalDetailsCardImg} src="https://img.alicdn.com/imgextra/i1/O1CN015QDDef1fK6AxYuhEp_!!6000000003987-2-tps-32-32.png" alt="" srcSet="" />
        </div>
    );
};

export default AdditionalDetailsCard;