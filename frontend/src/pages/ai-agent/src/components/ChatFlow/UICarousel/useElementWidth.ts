import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * 获取元素宽度的Hook
 */
export function useElementWidth<T extends HTMLElement>(): [RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(element.offsetWidth);
    };

    // 初始化获取宽度
    const timer = setTimeout(updateWidth, 0);

    // 监听窗口大小变化
    window.addEventListener('resize', updateWidth);

    // 使用 ResizeObserver 监听元素大小变化（如果支持）
    let resizeObserver: ResizeObserver | null = null;
    
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      try {
        resizeObserver = new ResizeObserver(() => {
          updateWidth();
        });
        resizeObserver.observe(element);
      } catch (error) {
        console.warn('ResizeObserver not supported');
      }
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
      resizeObserver?.disconnect();
    };
  }, []);

  return [ref, width];
}
