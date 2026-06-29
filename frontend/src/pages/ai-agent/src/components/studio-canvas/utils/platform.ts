// 扩展Navigator接口以支持userAgentData
interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    platform: string;
    brands?: Array<{ brand: string; version: string }>;
    mobile?: boolean;
  };
}

// 检测Mac系统的多种方式
export const isMacPlatform = (): boolean => {
  const nav = window.navigator as NavigatorWithUserAgentData;

  // 优先使用新标准 userAgentData
  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform === 'macOS';
  }

  // 回退到userAgent检测 (推荐)
  if (navigator.userAgent) {
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  // 最后回退到platform (已废弃，但作为兜底)
  if (navigator.platform) {
    return navigator.platform.includes('Mac');
  }

  return false;
};

export const isMac = isMacPlatform();
