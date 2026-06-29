import path from "path";

const whiteList = [];

// 辅助函数，判断值是否为空
const isValueEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  // 默认认为非上述类型为有效值
  return false;
};

// 过滤空值
export const filterEmptyParams = (params) => {
  const searchParams = Object.keys(params).reduce((acc, key) => {
    const val = params[key];
    if (!isValueEmpty(val)) {
      acc[key] = val;
    }
    return acc;
  }, {});

  return searchParams;
};

// 获取url search参数
export const getUrlSearchParams = () => {
  const searchParams = new URLSearchParams(location.search);

  return Object.fromEntries(searchParams);
};

// 替换url search参数
export const replaceUrlSearchParams = (params) => {
  // 创建当前 URL 的副本
  const url = new URL(location.href);

  // 获取当前 URL 的查询参数对象
  const currentParams = getUrlSearchParams();

  // 合并当前参数 + 新参数（新参数覆盖旧值）
  const mergedParams = { ...currentParams, ...params };

  // 过滤掉空值后的新参数
  const filteredParams = filterEmptyParams(mergedParams);

  url.search = "";

  for (const [key, value] of Object.entries(filteredParams) as any) {
    url.searchParams.set(key, value);
  }

  history.replaceState(null, "", url.toString());
};

const getBaseUrl = (linkUrl, params) => {
  const url = new URL(linkUrl);
  const currentSearchParams = getUrlSearchParams();

  // Step 1: 提取白名单参数（基于当前 URL）
  const whiteListedParams: any = {};
  whiteList.forEach((key) => {
    if (currentSearchParams.hasOwnProperty(key)) {
      whiteListedParams[key] = currentSearchParams[key];
    }
  });

  // Step 2: 清空 search
  url.search = "";

  // Step 3: 过滤新传入的参数
  const newParams = filterEmptyParams(params);

  // Step 4: 合并白名单参数 + 新参数（新参数覆盖旧值）
  const mergedParams = { ...whiteListedParams, ...newParams };

  // Step 5: 设置新的 search 参数
  for (const [key, value] of Object.entries(mergedParams) as any) {
    url.searchParams.set(key, value);
  }

  return url;
};

// 获取跳转链接
export const getLinkUrl = (linkUrl, params = {}, options = {}) => {
  const url = getBaseUrl(linkUrl, params);
  return url;
};

// 路由跳转
export const routeJump = (
  pagePath = "index",
  pageParams = {},
  options: any = {}
) => {
  const { openInNewTab = false, inheritParams = ["theme"], urlOnly = false } = options || {};
  const basePath = '/';

  // 使用相对路径跳转，只构建目标页面的基础URL
  const originUrl = path.join(location.origin, basePath, pagePath);

  // 检查当前页面的指定参数，如果有就带上
  const currentParams = new URLSearchParams(location.search);
  let finalParams = { ...pageParams };

  inheritParams.forEach((paramName) => {
    const currentValue = currentParams.get(paramName);
    if (currentValue && !pageParams[paramName]) {
      finalParams[paramName] = currentValue;
    }
  });

  const linkUrl = getLinkUrl(originUrl, finalParams).toString();

  if (urlOnly) {
    return linkUrl;
  }

  if (openInNewTab) {
    window.open(linkUrl, "_blank");
  } else {
    location.href = linkUrl;
  }
};
