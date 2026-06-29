import React, { useState } from "react";
import { Spin } from "antd";
import style from "./index.module.css";
import { imgIcon } from "../imgIcon";
import SpinData from "../SpinData";
import { EyeIcon } from "../EyeIcon";
import FrostedGlass from "../FrostedGlass";
import { $t } from "@/i18n";

interface SpinCardProps {
  content?: React.ReactNode;
  spinning?: boolean;
}
interface ImgCardProps {
  content?: React.ReactNode;
  list?: any[];
  title?: string;
  onDetailClick?: () => void;
  emptyText?: string;
  className?: string;
  imgClickLogKey?: string;
}

interface DifferenceCardProps {
  content?: React.ReactNode;
  title?: string;
  status?: string;
  successText?: string;
  compareText?: string;
  onDetailClick?: () => void;
  showDetail?: boolean;
  className?: string;
}

export const SpinCard: React.FC<SpinCardProps> = ({
  content = "",
  spinning,
}) => {
  return (
    <div className={style.spinCard}>
      <Spin
        spinning={spinning}
        indicator={<img src={imgIcon[6]} className={style.loadingSpin} />}
      />
      <div className={style.spinCardText}>
        {$t(
          "global-1688-ai-app.ChatFlow.SpecialCard.zkrx",
          "正在查找同关键词热销Top5",
        )}
      </div>
    </div>
  );
};
export const ImgCard: React.FC<ImgCardProps> = ({
  title,
  list,
  onDetailClick,
  emptyText = $t("global-1688-ai-app.ChatFlow.SpecialCard.zwtk", "暂无同款"),
  className,
  imgClickLogKey,
}) => {
  if (list?.length && list?.length > 0) {
    return (
      <div className={`${style.imgCard} ${className}`}>
        <div className={style.imgCardTitle}>
          <div className={style.imgCardTitleText}>{title}</div>
          {onDetailClick && (
            <div className={style.imgCardTitleImg}>
              <img
                className={style.imgCardTitleImgImg}
                src={imgIcon[5]}
                alt="img"
                onClick={onDetailClick}
              />
            </div>
          )}
        </div>
        <div className={style.imgCardContent}>
          {list?.map((ele, index) => (
            <FrostedGlass
              key={`${ele?.mainImgUrl}-${index}`}
              style={{ width: 32, height: 32 }}
              riskStatus={ele?.riskStatus}
              productUrl={ele?.productUrl || ''}
              imageUrl={ele?.mainImgUrl}
              logKey={imgClickLogKey}
              logParams={{
                productId: ele?.productId || '',
                title: ele?.title || '',
                isHotSaleItem: true,
              }}
            />
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`flex items-center h-[74px] text-[12px] text-[#7B7B8D] justify-center ${style.imgCard}`}
      >
        {emptyText}
      </div>
    );
  }
};

export const DifferenceCard: React.FC<DifferenceCardProps> = ({
  title,
  status,
  successText,
  compareText,
  onDetailClick,
  className,
  showDetail = true,
}) => {
  const [spinning, setSpinning] = useState(true);
  return (
    <div className={`${style.differenceCard} ${className}`}>
      {
        showDetail || title ? <div className={style.differenceCardTitle}>
          {
          title ? <div className={style.differenceCardTitleText}>{title}</div>
          : null
        }
          {status === "COMPARED" && showDetail && <EyeIcon onClick={onDetailClick} />}
        </div>
      : null
      }
      {status === "COMPARING" && (
        <SpinData spinning={spinning} text={compareText} direction="left" />
      )}
      {status === "COMPARED" && (
        <div className={style.differenceCardContent}>
          <img src={imgIcon[25]} className={style.successCardImg} />
          <div className={style.successCardContentText}>{successText}</div>
        </div>
      )}
    </div>
  );
};
