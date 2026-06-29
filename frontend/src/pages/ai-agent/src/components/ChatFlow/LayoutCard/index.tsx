import React from "react";
import style from './index.module.css';
import { $t } from '@/i18n';

interface DifferenceCardProps {
    children?: React.ReactNode;
}
const LayoutCard: React.FC<DifferenceCardProps> = ({ children }) => {
    return (
        <div className={style.layoutCard}>
            <div className={style.layoutCardTitle}>{$t("global-1688-ai-app.ChatFlow.LayoutCard.nqyrln", "您好，请补充您对于「新品」的要求，为您精准选品～")}</div>
            {children}
        </div>
    )
}

export default LayoutCard;