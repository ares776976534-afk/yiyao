/**
 * I18n 相关常量定义
 */

// 语言代码映射
export const LANG_MAPPING = {
  zh_CN: 'zh_CN', // 简体中文
  zh_HK: 'zh_HK', // 繁体中文
  en_US: 'en_US', // 英语
  ja_JP: 'ja_JP', // 日语
  es_ES: 'es_ES', // 西班牙语
  ko_KR: 'ko_KR', // 韩语
  vi_VN: 'vi_VN', // 越南语
  ru_RU: 'ru_RU', // 俄语
} as const;

export const LANGUAGE_OPTIONS = [
  { label: '简体中文', value: LANG_MAPPING.zh_CN },
  // { label: '繁體中文', value: LANG_MAPPING.zh_HK },
  // { label: 'English', value: LANG_MAPPING.en_US },
  // { label: '日本語', value: LANG_MAPPING.ja_JP },
  // { label: 'Español', value: LANG_MAPPING.es_ES },
  // { label: '한국어', value: LANG_MAPPING.ko_KR },
  // { label: 'Vietnamese', value: LANG_MAPPING.vi_VN },
  // { label: 'Russian', value: LANG_MAPPING.ru_RU },
];

// 默认语言，用户未登录或者未主动设置过语言，使用vm上根据ip判断出来的语言；否则默认指定中文
export const DEFAULT_LANG = window.pageData?.language || 'zh_CN';
// export const DEFAULT_LANG = 'zh_CN';
// 默认应用名称
export const DEFAULT_APP_NAME = '1688-alphashop-studio';

// API相关
export const API_CONFIG = {
  LANG_CDN_BASE: 'https://lang.alicdn.com/versioninfo',
  ENV_DAILY: 'daily',
  ENV_MCMS: 'mcms',
} as const;

// 事件名称
export const EVENTS = {
  I18N_REFLUSH: '1688-alphashop-studio-i18n-reflush',
} as const;
