import { useState, useEffect } from 'react';
import { isBrowser } from '@/utils/browserCheck';

/**
 * 大屏检测相关的类型定义
 */
export interface TypeLargeScreenInfo {
  isLargeScreen: boolean;
  screenWidth: number;
  screenHeight: number;
}

/**
 * 判断是否为大屏的hooks
 * @param breakpoint 大屏断点，默认1920px
 * @returns 大屏信息对象
 */
export const useLargeScreen = (breakpoint: number = 1920): TypeLargeScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<TypeLargeScreenInfo>({
    isLargeScreen: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    if (!isBrowser()) {
      setScreenInfo({
        isLargeScreen: false,
        screenWidth: 0,
        screenHeight: 0,
      });
      return;
    }

    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLargeScreen = (width >= breakpoint);

      setScreenInfo({
        isLargeScreen,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // 初始检测
    updateScreenInfo();

    // 监听窗口大小变化
    const handleResize = () => {
      updateScreenInfo();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return screenInfo;
};
