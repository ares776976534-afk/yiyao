import React from "react";
import { Button } from "antd";
import style from "./index.module.css";
import { imgIcon } from "../imgIcon";

interface ColorfulBtnProps {
    title?: React.ReactNode | string;
    onClick?: () => void;
    icon?: number | null;
    className?: string;
    disabled?: boolean;
}

export const ColorfulBtn = ({ title, onClick, icon, className, disabled = false }: ColorfulBtnProps) => {
    return (
        <Button type="primary" onClick={onClick} className={`${style.itemInfoCardSameStyleBtn} ${className}`} disabled={disabled}>
            {icon && <img className={style.itemInfoCardLeftButtonIcon} src={imgIcon[icon]} alt="img" />}
            <span className={style.itemInfoCardSameStyleText}>{title}</span>
        </Button>
    )
}

export const DefaultBtn = ({ title, onClick, icon, className }: ColorfulBtnProps) => {
    return (
        <Button type="primary" onClick={onClick} className={`${style.defaultButtonContainer} ${className}`}>
            {icon && <img className={style.itemInfoCardLeftButtonIcon} src={imgIcon[icon]} alt="img" />}
            <span className={style.itemInfoCardLeftButtonText}>{title}</span>
        </Button>
    )
}