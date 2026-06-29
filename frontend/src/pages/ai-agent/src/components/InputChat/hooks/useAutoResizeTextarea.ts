import { useRef, useEffect, useCallback } from 'react';

// 自定义Hook：自动调整textarea高度
export const useAutoResizeTextarea = (value: string, minHeight = 70, maxHeight = 164) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 临时设置为最小高度以获取准确的scrollHeight
    textarea.style.height = `${minHeight}px`;

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minHeight, maxHeight]);

  // 监听value变化
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // 组件挂载后立即调整
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
};