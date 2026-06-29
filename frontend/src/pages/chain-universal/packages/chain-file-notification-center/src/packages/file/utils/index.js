import qs from 'query-string';


const qsOptions = { strict: false };

export const isType = type => obj => Object.prototype.toString.call(obj) === `[object ${type}]`;
export const isObj = isType('Object');
export const isArr = Array.isArray || isType('Array');

/**
 * 是否是对象或者数组
 * @param {*} target
 */
export function isComplexType(target) {
  return target !== null && typeof target === 'object';
}

/**
 * 是否是对象数组
 * @param {*} arr
 */
export function isComplexArr(arr) {
  if (!arr) return false;
  return isArr(arr) && arr.length && arr.some(isComplexType);
}

/**
 * 将数据序列化成JSON path的形式
  {
    key1: { key2: { a: 1 } },
    key3: [{b: 2 }, { b: 3 }]
  }
  ===>
  {
    'key1.key2.a' : 1,
    'key3[0].b' : 2,
    'key3[1].b' : 3
  }
 */
export function serializeAsJsonpath(data) {
  const res = {};
  const r = (path, target) => {
    if (isComplexArr(target)) {
      target.map((t, index) => r(`${path}[${index}]`, t));
    } else if (target && isObj(target)) {
      Object.keys(target).map(key => r(`${path}.${key}`, target[key]));
    } else {
      res[path] = target;
    }
  };
  Object.keys(data).forEach((key) => {
    r(key, data[key]);
  });
  return res;
}

/**
 * 处理错误
 * @param {Function} hook 错误处理函数
 * @param {Object} err 错误对象
 */
export function handleException(hook, err) {
  const e = err || {};
  hook && !e.isHookCalled && hook(e);
  console && console.error(e);
  e.isHookCalled = true;
  throw e;
}

/**
 * 将额外的参数合并到URL中, url已有同名参数会被覆盖
 * @param {String} originUrl 原始URL地址
 * @param {Object} data 增加的额外参数对象
 */
export function rewriteUrlParams(originUrl, data) {
  if (!originUrl) {
    return '';
  }
  const url = originUrl.split('?')[0];
  const query = qs.parse(qs.extract(originUrl, qsOptions));
  // 传入参数会覆盖URL中同名参数
  const jsonpath = serializeAsJsonpath({ ...query, ...data });
  return `${url}?${qs.stringify(jsonpath, qsOptions)}`;
}

/**
 * 使用iframe的方式加载待下载地址
 * @param  {String} url 待下载的地址
 * @param  {Object} data 下载请求携带的参数
 */
export function downloadByIframe(url, data) {
  const iframe = document.createElement('iframe');
  iframe.src = rewriteUrlParams(url, data);
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 25000);
}

export const emitTochild = (data) => {
  window.postMessage(data);
};

export function record(event, extData) {
  try {
    if (window.TES && typeof window.TES.event === 'function') {
      window.TES.event(event, extData);
    }
  } catch (error) {
    console.error(error);
  }
}
