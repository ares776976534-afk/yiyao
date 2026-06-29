import React, { ReactNode } from 'react';
import { Spin, Tooltip } from 'antd';
import HeaderActions, { HeaderActionsProps } from '@/components/SelectProduct/HeaderActions';
import styles from './headerBar.module.css';

type HeaderBarProps = {
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
  subtitlePosition?: 'left' | 'right';
  subtitleOnClick?: () => void;
  subtitleLoading?: boolean;
  slotTitle?: ReactNode;
  actions?: HeaderActionsProps;
  className?: string;
  fullscreen?: boolean;
  customRightContent?: React.ReactNode; // 自定义右侧内容，优先级高于 actions
  tooltip?: ReactNode;
  sessionId: string;
  taskId: string;
  oppScene?: string; // 用于区分不同agent的埋点
};
const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  subtitleClassName,
  subtitlePosition = 'left',
  subtitleOnClick,
  subtitleLoading = false,
  fullscreen,
  actions,
  className,
  customRightContent,
  slotTitle,
  tooltip,
  sessionId,
  taskId,
  oppScene,
}) => {
  const subtitleElement = subtitle && (
    <span
      className={subtitleClassName || "text-[16px] text-[#7B7B8D] ml-[8px]"}
      onClick={subtitleLoading ? undefined : subtitleOnClick}
      style={subtitleOnClick && !subtitleLoading ? { cursor: 'pointer' } : subtitleLoading ? { cursor: 'not-allowed', opacity: 0.6 } : undefined}
    >
      {subtitleLoading ? (
        <span className="flex items-center gap-[6px]">
          <Spin size="small" />
          <span>{subtitle}</span>
        </span>
      ) : (
        subtitle
      )}
    </span>
  );

  return (
    <div className={`flex justify-between items-center ${className || ''}`}>
      <div className="flex items-center">
        <span className={styles.title}>
          {title}
          {tooltip}
        </span>
        {subtitlePosition === 'left' && subtitleElement}
        {slotTitle}
      </div>
      <div className="flex items-center">
        {subtitlePosition === 'right' && subtitleElement}
        {customRightContent || <HeaderActions {...(actions || {})} sessionId={sessionId} taskId={taskId} fullscreen={fullscreen} oppScene={oppScene} />}
      </div>
    </div>
  );
};

export default HeaderBar;
