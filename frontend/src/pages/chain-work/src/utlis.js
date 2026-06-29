import React from 'react';
import moment from 'moment';
import { Dialog, Message, Icon } from '@alifd/next';
import { getDingTalkId } from '@/pages/Replenishment/services/action';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import configCenter from '@alife/channel-uni-config-center';
import diorRequest from './service/diorRequest';
import LZString from 'lz-string';

export const formatDate = (date, splitSymbol = ' ') => {
  if (!date) {
    return {
      date: '-',
      ymd: '-',
      hms: '-',
    };
  }
  const dateString = moment(date).format('YYYY/MM/DD HH:mm:ss') || '-';
  const dateSplit = dateString.split(splitSymbol);
  return {
    date: dateString || '-',
    ymd: dateSplit[0] || '-',
    hms: dateSplit[1] || '-',
  };
};

export const splitNum = (value, n = 3) => {
  let num = Number(value);
  if (typeof num !== 'number' || num === 0) {
    return '-';
  }

  const sy = num < 0 ? '-' : '';
  num = Math.abs(num || 0).toString();
  let number = 0;
  let floatNum = '';
  let intNum = '';

  if (num.indexOf('.') > 0) {
    number = num.indexOf('.');
    floatNum = num.substr(number);
    intNum = num.substring(0, number);
  } else {
    intNum = num;
  }
  const result = [];
  let counter = 0;
  intNum = intNum.split('');

  for (let i = intNum.length - 1; i >= 0; i--) {
    counter++;
    result.unshift(intNum[i]);
    if (!(counter % n) && i !== 0) {
      result.unshift(',');
    }
  }
  return `${sy}${result.join('')}${floatNum}`;
};

// 下载
export const openLinkAndDownload = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '');
  link.setAttribute('target', '_blank');
  link.click();
};

export const systemTime = {
  set: (time) => {
    window.__systemTime__ = time;
  },
  get: () => window.__systemTime__,
};

export const isTrue = (val) => {
  return val === 'true' || val === true;
};

export const speaker = ({ text, speechRate, lang, volume, pitch }, startEvent) => {
  return new Promise((resolve) => {
    if (!window.SpeechSynthesisUtterance) {
      console.warn('当前浏览器不支持文字转语音服务');
      return;
    }

    if (!text) {
      return;
    }

    const speechUtterance = new SpeechSynthesisUtterance();
    speechUtterance.text = text;
    speechUtterance.rate = speechRate || 1;
    speechUtterance.lang = lang || 'zh-CN';
    speechUtterance.volume = volume || 1;
    speechUtterance.pitch = pitch || 1;
    speechUtterance.onend = function () {
      resolve(speechUtterance);
    };
    speechUtterance.onstart = function () {
      startEvent && startEvent();
    };
    speechSynthesis.speak(speechUtterance);

    return speechUtterance;
  });
};

export function formatTime(time) {
  const days = Math.floor(time / (3600 * 24))
    .toString()
    .padStart(2, '0');
  time %= 3600 * 24;
  const hours = Math.floor(time / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0').substring(0, 2);
  return { days, hours, minutes, seconds };
}

export const dingTalkSend = () => {
  Dialog.notice({
    title: '是否已下载钉钉',
    footerAlign: 'center',
    footerActions: ['ok', 'cancel'],
    onCancel: () => {
      getDingTalkId().then((id) => {
        if (id) {
          window.open(`dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=${id.split(':')[1]}`, '_self');
        } else {
          Message.error('请稍后再试');
        }
      });
    },
    onOk: () => {
      window.open('https://page.dingtalk.com/wow/z/dingtalk/simple/ddhomedownload#/', '_blank');
    },
    okProps: {
      children: '下载钉钉',
    },
    cancelProps: {
      children: '打开钉钉',
    },
  });
};

export const transformFieldLabel = (text, isPreivew) => {
  return isPreivew ? `${text}：` : text;
};

export const fromEntries = (obj) => {
  const result = {};
  obj.forEach(([key, value]) => {
    result[key] = value;
  });
  return result;
};

export const isPreEnv = () => {
  return window.location.host.indexOf('pre-') > -1 || window.location.href.indexOf('_env_=pre') > -1;
};

export const appendScript = (src, cb) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = () => {
      cb && cb();
      resolve();
    };
    document.body.appendChild(script);
  });
};
export const appendCss = (href, cb) => {
  return new Promise((resolve) => {
    try {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.type = 'text/css';
      css.href = href;

      css.onload = () => {
        cb && cb();
        resolve();
      };
      document.body.appendChild(css);
    } catch (e) {
      console.log('css error', e);
    }
  });
};

export const getUmidToken = () => {
  return new Promise((resolve) => {
    if (window.umidToken.indexOf('defaultToken1') != -1 || window.umidToken.indexOf('defaultToken3') != -1) {
      setTimeout(() => {
        resolve(window.umidToken);
      }, 1500);
    } else {
      resolve(window.umidToken);
    }
  });
};

export const isInIframe = () => {
  return window !== window.parent;
};

export const Logger = {
  init(initData, aplusParams) {
    if (aplusParams && !aplusParams.appKey) aplusParams.appKey = 'a2639r';
    if (window.globalLogger) {
      window.globalLogger.init(initData, aplusParams);
      this.getRrwebRecorder();
    } else {
      const globalLogger_queue = window.globalLogger_queue || (window.globalLogger_queue = []);
      globalLogger_queue.push({
        action: 'init',
        value: {
          ...initData,
        },
        aplusParams,
        cb: () => {
          this.getRrwebRecorder();
        },
      });
    }
  },
  report(data) {
    if (window.globalLogger) {
      window.globalLogger.reportByManual(data);
    }
  },
  getLogger() {
    return window.globalLogger;
  },
  // 若有录制实例直接返回，否则初始化/开始录制
  getRrwebRecorder() {
    if (window.rrwebRecorder) return window.rrwebRecorder;
    if (window.globalLogger) {
      const rrwebRecorder = new window.globalLogger.RrwebRecorder();
      console.log('start logging---');
      rrwebRecorder.startRecord();
      window.rrwebRecorder = rrwebRecorder;
      return rrwebRecorder;
    }
    return null;
  },
  saveRecord(err) {
    const rrwebRecorder = this.getRrwebRecorder();
    if (!rrwebRecorder) return () => {};
    rrwebRecorder.saveRecord(err);
  },
};

// 推送错误轨迹
// export const saveRecord = (err) => {
//   const rrwebRecorder = Logger2.getRrwebRecorder();
//   if (!rrwebRecorder) return () => {};
//   rrwebRecorder.saveRecord(err);
// };

// 获取url参数
export const getQueryParams = (paramName) => {
  const queryParams = {};
  const parser = document.createElement('a');
  parser.href = window.location.href;
  const queryStr = parser.search.substring(1);
  const params = queryStr.split('&');
  for (let i = 0; i < params.length; i++) {
    const pair = params[i].split('=');
    queryParams[pair[0]] = decodeURIComponent(pair[1]);
  }
  return queryParams[paramName] !== undefined ? queryParams[paramName] : null;
};

const MessageShow = ({ value, content, color, type }) => {
  // 检查是否包含HTML标签
  const hasHtmlTags = /<[^>]*>/g.test(value);

  Message.show({
    iconType: false,
    title: (
      <div className="flex items-center ml-[-22px]">
        <Icon type={type} style={{ color, marginRight: '10px' }} />
        {hasHtmlTags ? (
          <span dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          value
        )}
      </div>
    ),
    content,
  });
};

export const MessageError = (value, content) => {
  MessageShow({ value, content, color: '#FF0000', type: 'd-cancel' });
};

export const MessageSuccess = (value, content) => {
  MessageShow({ value, content, color: '#25BE13', type: 'success' });
};

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function splitArray(array, index) {
  // 检查分割点的有效性
  if (index < 0 || index > array?.length) {
    return [array, []];
  }

  // 创建两个新数组
  const firstPart = array?.slice(0, index);
  const secondPart = array?.slice(index);
  return [firstPart, secondPart];
}

export const scrollTo = (ele, offset = 0) => {
  window.scrollTo({
    top: ele.offsetTop + offset,
    behavior: 'smooth',
  });
};

export const getResourceById = (id) => {
  return configCenter.getByResourceId(id).then((_res) => {
    const res = _res[0] || _res || {};
    if (res && res.data && res.data.length) {
      return res.data;
    } else if (res && res.data && res.data.data) {
      return res.data.data;
    }
    return [];
  });
};

export const stringTpl = (tpl, data) => {
  const computed = tpl.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || '';
  });
  return computed;
};

// 通用的打标和查标服务
export const tagService = (tagId, params = {}) => {
  const get = () => {
    return new Promise((resolve) => {
      diorRequest('CDT_86f0gx', 'queryDataTag', {
        tagId,
        ...params,
      })
        .then((res) => {
          resolve(res?.model || false);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };

  const put = () => {
    return new Promise((resolve) => {
      diorRequest('CDT_86f0gx', 'addDataTag', {
        tagId,
        ...params,
      })
        .then(({ model, code, msg }) => {
          resolve({
            success: model,
            code,
            msg,
          });
        })
        .catch((err) => {
          resolve({
            success: false,
            code: err?.code,
            msg: err?.msg,
          });
        });
    });
  };

  return {
    get,
    put,
  };
};
export const getFieldRules = (key) => {
  const res = [];
  const rules = {
    round_two: {
      pattern: /^(0(\.\d{1,2})|([1-9]\d*(\.\d{1,2})?))$/,
      message: '最多保留两位小数,且仅支持数字输入',
    },
    integer: { pattern: /^[1-9]\d*$/, message: '请输入大于0的整数' },
    round_one: { pattern: /^\d+(\.\d{1})?$/, message: '最多保留一位小数,且仅支持数字输入' },
    required: { required: true, message: '此为必填项' },
  };
  if (Array.isArray(key)) {
    key.forEach((item) => {
      if (typeof item === 'string') {
        res.push(rules[item]);
      } else if (typeof item === 'object') {
        res.push(item);
      }
    });
    return res;
  } else {
    res.push(rules[key]);
    return res;
  }
};

export const dealPrice = (price) => {
  if (price) {
    return (parseFloat(price) / 100).toFixed(2);
  }
  return undefined;
};

export const getLzString = (params) => {
  try {
    return LZString.decompressFromEncodedURIComponent(params || '');
  } catch (e) {
    return params;
  }
};
export const setLzString = (params) => {
  try {
    return LZString.compressToEncodedURIComponent(JSON.stringify(params));
  } catch (e) {
    return params;
  }
};

export const openNewWindow = (baseUrl) => {
  let _url = baseUrl;
  if (window.globalLogger) {
    _url = window.globalLogger.generateURL(baseUrl);
  }
  window.open(_url, '_blank');
};

export const isFunction = (obj) => {
  return typeof obj === 'function';
};
