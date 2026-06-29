import { useNavigate } from 'ice';
import { appBaseUrl } from '@/utils/env';

/**
 * 导航后滚动的配置选项
 */
interface NavigateWithScrollOptions {
  /**
   * 是否平滑滚动，默认为false（瞬间滚动）
   */
  smooth?: boolean;
  target?: 'self' | 'blank';
}

/**
 * 导航函数
 */
type NavigateFunction = (to: string, opts?: any) => any;

/**
 * 带滚动功能的导航Hook
 * 在执行路由跳转后自动滚动到页面顶部
 *
 * @param options 配置选项 可选
 * @returns 增强的导航函数
 */
export const useNavigateWithScroll = (options: NavigateWithScrollOptions = {}): NavigateFunction => {
  const navigate = useNavigate();
  const { smooth = true } = options;

  /**
   * 增强的导航函数，在跳转后自动滚动到顶部
   */
  const navigateWithScroll = (to, opts: any = {}) => {
    const { params = {}, target = 'self', replace = false } = opts || {};
    const paramsString = new URLSearchParams(params).toString();

    if (target === 'blank' || replace) {
      window.open(`${appBaseUrl}${to}${paramsString ? `?${paramsString}` : ''}`, replace ? '_self' : '_blank');
      return;
    } else {
      // 执行原始导航
      const result = navigate(`${to}${paramsString ? `?${paramsString}` : ''}`, opts);

      // 使用 setTimeout 确保在路由跳转后执行滚动
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }, 0);

      return result;
    }

  };

  return navigateWithScroll;
};
