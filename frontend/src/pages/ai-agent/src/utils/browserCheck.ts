/**
 * 浏览器环境检查工具函数
 * 用于在SSR环境中安全地访问浏览器API
 */

/**
 * 检查是否在浏览器环境中
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * 安全地访问window对象
 * 在SSR环境中返回undefined
 */
export const getWindow = (): Window | undefined => {
  return isBrowser() ? window : undefined;
};

/**
 * 安全地访问document对象
 * 在SSR环境中返回undefined
 */
export const getDocument = (): Document | undefined => {
  return isBrowser() ? document : undefined;
};

/**
 * 安全地访问navigator对象
 * 在SSR环境中返回undefined
 */
export const getNavigator = (): Navigator | undefined => {
  return isBrowser() ? navigator : undefined;
};

/**
 * 安全地访问location对象
 * 在SSR环境中返回undefined
 */
export const getLocation = (): Location | undefined => {
  return isBrowser() ? location : undefined;
};

/**
 * 安全地执行setTimeout
 * 在SSR环境中返回0
 */
export const safeSetTimeout = (callback: (...args: any[]) => void, delay: number): number => {
  if (isBrowser()) {
    return window.setTimeout(callback, delay);
  }
  return 0;
};

/**
 * 安全地执行clearTimeout
 * 在SSR环境中不执行任何操作
 */
export const safeClearTimeout = (id: number): void => {
  if (isBrowser()) {
    window.clearTimeout(id);
  }
};

/**
 * 安全地执行setInterval
 * 在SSR环境中返回0
 */
export const safeSetInterval = (callback: (...args: any[]) => void, delay: number): number => {
  if (isBrowser()) {
    return window.setInterval(callback, delay);
  }
  return 0;
};

/**
 * 安全地执行clearInterval
 * 在SSR环境中不执行任何操作
 */
export const safeClearInterval = (id: number): void => {
  if (isBrowser()) {
    window.clearInterval(id);
  }
};

/**
 * 安全地访问window.innerWidth
 * 在SSR环境中返回默认值
 */
export const getInnerWidth = (defaultValue: number = 1920): number => {
  if (isBrowser()) {
    return window.innerWidth;
  }
  return defaultValue;
};

/**
 * 安全地访问window.innerHeight
 * 在SSR环境中返回默认值
 */
export const getInnerHeight = (defaultValue: number = 1080): number => {
  if (isBrowser()) {
    return window.innerHeight;
  }
  return defaultValue;
};

/**
 * 安全地访问window.outerWidth
 * 在SSR环境中返回默认值
 */
export const getOuterWidth = (defaultValue: number = 1920): number => {
  if (isBrowser()) {
    return window.outerWidth;
  }
  return defaultValue;
};

/**
 * 安全地访问window.visualViewport
 * 在SSR环境中返回undefined
 */
export const getVisualViewport = (): VisualViewport | undefined => {
  if (isBrowser()) {
    return window.visualViewport;
  }
  return undefined;
};

/**
 * 检测是否为移动端设备
 * 在SSR环境中返回false
 */
export const isMobile = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  // 检查用户代理字符串
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));

  // 检查屏幕宽度
  const isMobileScreen = window.innerWidth <= 768;

  // 检查触摸支持
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};
