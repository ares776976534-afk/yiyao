import { useState, useEffect } from 'react';
import { isBrowser } from '@/utils/browserCheck';

/**
 * 设备检测相关的类型定义
 */
export interface TypeDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  isTouchDevice: boolean;
}

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (!isBrowser()) {
      setIsMobile(false);
      return;
    }

    const updateIsMobile = () => {
      // 检查用户代理字符串
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));

      // 检查屏幕宽度
      const isMobileScreen = window.innerWidth <= 768;

      // 检查触摸支持
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      const result = isMobileUserAgent || (isMobileScreen && isTouchDevice);
      setIsMobile(result);
    };

    // 初始检测
    updateIsMobile();

    // 监听窗口大小变化
    const handleResize = () => {
      updateIsMobile();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};