import { aplus_universal } from '@ali/aplus_universal';
import throttle from 'lodash/throttle';
// 黄金令箭类型定义
type TypeLogKey = `/${string}.${string}.${string}`;
type TypeGmKey = "CLK" | "EXP" | "OTHER";
type TypeMethod = "GET" | "POST";
type TypeGoKey = string | Record<string, any>;
type TypeThrottleConfig = number | {
  wait?: number;
  options?: Parameters<typeof throttle>[2];
};
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const userPrefer = window.pageData?.userPrefer || {};
const isAllowAnalytics = userPrefer?.cookieManager?.analytics ?? true;

export const resetUserInfo = (uidaplus: string) => {
  if (!isAllowAnalytics) return;
  aplus_universal.setUserProfile({
    uidaplus: uidaplus,
  });
};

export const commonRecord = (actionName: string, logParams: Record<string, any> = {}) => {
  if (!isAllowAnalytics) return;
  aplus_universal.record(
    '/alphashop.common.click',
    'CLK',
    new URLSearchParams({ actionname: actionName, ...logParams }).toString(),
    'POST',
  );
};

export const googleRecord = (actionName: string, logParams: Record<string, any> = {}, reportUriPath: string = '') => {
  try {
    if (reportUriPath && window?.location?.pathname !== reportUriPath) return;
    console.log('googleRecord', actionName, logParams, reportUriPath);
    window?.dataLayer?.push({
      event: actionName,
      ...logParams,
    });
  } catch (error) {
    console.error('googleRecord error', error);
  }
};

// 存储每个 logkey 对应的节流函数
const throttledFunctions: Record<string, ReturnType<typeof throttle>> = {};

export default {
  /**
   * 黄金令箭埋点记录方法
   * @param logKey 令箭编码，以"/"开头的，三段位字符串
   * @param gmkey 令箭类型：CLK（点击）、EXP（曝光）、OTHER（其他）
   * @param gokey 自定义参数，支持两种格式：1. 以"&"符号拼接的字符串 2. key-value的简单对象。如果key或value中有特殊字符，需要先使用encodeURIComponent编码
   * @param method 请求方法，可选值：GET、POST，默认为GET
   * @param callTimes 反复调用的节流策略，默认为空表示不限流。可传入毫秒数或配置对象 { wait: 毫秒数, options: { leading, trailing } }，默认 leading: false, trailing: true
   */
  record: (
    logKey: string,
    gmkey: TypeGmKey,
    gokey?: TypeGoKey,
    method: TypeMethod = 'GET',
    callTimes?: TypeThrottleConfig,
  ) => {
    if (!isAllowAnalytics) return;

    const executeLog = () => {
      aplus_universal.record(
        logKey,
        gmkey,
        new URLSearchParams(gokey).toString(),
        method,
      );
    };

    // 如果没有设置 callTimes，立即执行
    if (!callTimes) {
      executeLog();
      return;
    }

    // 如果设置了 callTimes，使用节流函数
    const throttleKey = `${logKey}_${gmkey}`;
    let throttledFn = throttledFunctions[throttleKey];

    if (!throttledFn) {
      // 解析 callTimes 参数
      let wait: number;
      let options: Parameters<typeof throttle>[2];

      if (typeof callTimes === 'number') {
        // 直接传入毫秒数
        wait = callTimes;
        options = { leading: false, trailing: true };
      } else {
        // 传入配置对象
        wait = callTimes.wait || 1000;
        options = callTimes.options || { leading: false, trailing: true };
      }

      // 创建新的节流函数并缓存
      throttledFn = throttle(executeLog, wait, options);
      throttledFunctions[throttleKey] = throttledFn;
    }

    throttledFn();
  },
};
