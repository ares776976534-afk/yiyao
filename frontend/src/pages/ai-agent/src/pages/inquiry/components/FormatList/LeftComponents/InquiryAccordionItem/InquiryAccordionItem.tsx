import React, { type ReactNode } from "react";
import { OkIcon } from "./okIcon";
import SpinningIcon from "./SpinningIcon";

import styles from "./index.module.css";

export interface TypeInquiryAccordionItemProps {
    title: string;
    isExpanded: boolean;
    shouldStream: boolean;
    onChange: (expanded: boolean) => void;
    className?: string;
    children: ReactNode;
    status?: "IN_PROGRESS" | "IN_PROCESS" | "FINISHED";
    hide?: boolean;
}

/**
 * Inquiry 页面专用的折叠面板组件
 */
export const InquiryAccordionItem: React.FC<TypeInquiryAccordionItemProps> = (
    props
) => {
    const { title, onChange, children, status, hide = false } = props;
    console.info(props, "propsprops===");
    // 处理 IN_PROCESS（拼写错误）和 IN_PROGRESS，都视为进行中
    const isInProgress = status === "IN_PROGRESS" || status === "IN_PROCESS";
    const isFinished = status === "FINISHED";

    // 调试日志
    // console.log('[InquiryAccordionItem]', props);

    if (hide) {
        return null;
    }
    return (
      <div style={{ display: 'flex' }}>
        <div
          className={`${styles.leftBox} ${
            isInProgress ? styles.leftBoxInProgress : ""
          } ${title === "询盘报告" ? styles.leftBoxNotAfter : ""}`}
        >
          {isInProgress ? (
            <SpinningIcon />
          ) : (
            <img
              className={styles.leftBoxOkIcon}
              src="https://img.alicdn.com/imgextra/i4/O1CN01gmJWtH1Mhw8MaD7xl_!!6000000001467-2-tps-64-64.png"
              alt=""
            />
          )}
        </div>
        <div className={styles.inquiryCard}>
          <div
            className={
              "flex-col gap-[12px] text-[14px] text-[#7C7F9A] pl-[10px] pr-[0x] plan-content "
            }
          >
            {/* <div className={styles.title}>{title}</div> */}
            {children}
          </div>
        </div>
      </div>
    );
};

export default InquiryAccordionItem;
