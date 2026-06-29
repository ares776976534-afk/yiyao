import React, { type ReactNode, useState, useEffect } from "react";
import { ChevronUpIcon, DoubleLeftIcon, PanelIcon } from "@/components/Icons";
import { DownArrowIcon, PlanningIcon, TaskIcon } from "@/components/Icon";
import styles from "./accordionItem.module.css";

export interface TypeAccordionItemProps {
  title: string;
  isExpanded: boolean;
  shouldStream: boolean;
  onChange: (expanded: boolean) => void;
  className?: string;
  children: ReactNode;
  hide?: boolean;
  icon?: string;
}

export const icons = {
  plan: <PlanningIcon fill="var(--icon-accent)" />,
  execute: <TaskIcon fill="var(--icon-accent)" />,
};

/**
 * 折叠面板组件
 */
export const AccordionItem: React.FC<TypeAccordionItemProps> = ({
  title,
  isExpanded,
  onChange,
  className = "",
  children,
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 组件挂载后触发出现动效 - 使用clip-path实现从左上角展开的效果
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    onChange(!isExpanded);
  };

  return (
    <div
      className={`
        border-[1px] border-[#F3F3F6] rounded-[16px]
       bg-[#FFF]
        ${className}
        ${isVisible ? "pointer-events-all" : "pointer-events-none"}
      `}
      style={{
        opacity: isVisible ? 1 : 0,
        clipPath: isVisible
          ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          : "polygon(0 0, 0 0, 0 0, 0 0)",
        transition:
          "opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), clipPath 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {/* 头部按钮 */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-[16px] p-[16px] leading-[20px] rounded-[16px] text-left bg-[#FFF] transition-all duration-200 ease-out"
      >
        <div className={styles.accordionHeaderLeft}>
          {icons[icon]}
          <span className={styles.accordionTitle}>{title}</span>
        </div>
        {/* <span className="ml-auto text-[#7B7B8D] text-[14px] mr-2">
          {isExpanded ? '' : '展开查看'}
        </span> */}

        {isExpanded ? (
          <ChevronUpIcon className="text-[#7B7B8D]" size={14} />
        ) : (
          <DownArrowIcon />
        )}
      </button>
      {/* 内容区域 - 使用平滑的折叠展开动效 */}
      <div
        className={`overflow-hidden ${isExpanded ? "" : "collapsed"}`}
        style={{
          maxHeight: isExpanded ? "9999px" : "0px",
          transition: isExpanded
            ? "max-height 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19)"
            : "max-height 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="flex flex-col gap-[12px] text-[14px] text-[#1b1c1d] pl-[16px] pr-[16px] pb-[16px] pt-[4px]">
          {children}
        </div>
      </div>
    </div>
  );
};
