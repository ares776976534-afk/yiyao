import { useState, useEffect } from 'react';

/**
 * 获取窗口宽度的Hook
 */
export function useWindowWidth(): number {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // 获取窗口宽度
    const getWindowWidth = () => {
      return typeof window !== 'undefined' ? window.innerWidth : 0;
    };

    // 初始化设置窗口宽度
    setWindowWidth(getWindowWidth());

    // 监听窗口大小变化
    const handleResize = () => {
      setWindowWidth(getWindowWidth());
    };

    window.addEventListener('resize', handleResize);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
}
