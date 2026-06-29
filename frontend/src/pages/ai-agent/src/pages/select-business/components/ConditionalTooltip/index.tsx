import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from 'antd';

// 条件性 Tooltip 组件：只有在文字被省略时才显示
const ConditionalTooltip: React.FC<{
  title: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ title, children, placement = 'bottom' }) => {
  const [isOverflow, setIsOverflow] = useState(false);
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        // 检查是否有垂直或水平溢出
        const isVerticalOverflow = textRef.current.scrollHeight > textRef.current.clientHeight;
        const isHorizontalOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
        setIsOverflow(isVerticalOverflow || isHorizontalOverflow);
      }
    };

    checkOverflow();
    // 监听窗口大小变化
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  // 克隆子元素并添加 ref
  const childWithRef = React.cloneElement(children, {
    ref: textRef,
  } as any);

  // 只有溢出时才显示 Tooltip
  if (isOverflow) {
    return (
      <Tooltip title={title} placement={placement}>
        {childWithRef}
      </Tooltip>
    );
  }

  return childWithRef;
};

export default ConditionalTooltip;
