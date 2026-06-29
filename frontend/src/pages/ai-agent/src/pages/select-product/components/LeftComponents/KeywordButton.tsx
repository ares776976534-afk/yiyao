import React from "react";
import { DocumentIcon } from "@/components/Icon";
import { type TypeRightPanelSide } from "@/types/select-product";
import style from "./keywordButton.module.css";
import log from "@/utils/log";

interface KeywordButtonProps {
  description?: string;
  title?: string;
  cardSubType?: TypeRightPanelSide;
  onMoreClick: (rightSideType: string, rightSideData: any) => void;
  type?: string;
  logKey?: string;
}

export const KeywordButton: React.FC<KeywordButtonProps> = (props) => {
  const { description, title, cardSubType, onMoreClick, type, logKey } = props;
  const isMobile = type === 'mobile';

  return (
    <div
      className={style.keywordButton}
      onClick={() => {
        if (cardSubType && !isMobile) {
          // 埋点：记录按钮点击
          if (logKey) {
            log.record(logKey as `/${string}.${string}.${string}`, 'CLK', { cardSubType, title });
          }
          onMoreClick(cardSubType, props);
        }
      }}
    >
      <div className={isMobile ? style.keywordButtonMobileContent : style.keywordButtonContent}>
        <div className={style.keywordButtonText}>
          <DocumentIcon fill="var(--text-primary)" />
          <span className="text-[13px] text-ellipsis line-clamp-1 flex-1">
            {title}
          </span>
        </div>
        <span className="text-[#7C7F9A] text-[13px] text-ellipsis line-clamp-1 flex-1">{description}</span>
      </div>
    </div>
  );
};
