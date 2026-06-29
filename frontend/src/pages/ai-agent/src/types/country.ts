import { $t } from '@/i18n';
// 国家代码到中文名称的映射
export const COUNTRY_MAP = [
  {
    code: 'US',
    name: $t("global-1688-ai-app.country.beautifulg", "美国"),
    currency: '$',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'ES',
    name: $t("global-1688-ai-app.country.xby", "西班牙"),
    currency: '€',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'BR',
    name: $t("global-1688-ai-app.country.bx", "巴西"),
    currency: 'R$',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'FR',
    name: $t("global-1688-ai-app.country.fg", "法国"),
    currency: '€',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'MX',
    name: $t("global-1688-ai-app.country.mxg", "墨西哥"),
    currency: '$',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'GB',
    name: $t("global-1688-ai-app.country.yg", "英国"),
    currency: '£',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'DE',
    name: $t("global-1688-ai-app.country.dg", "德国"),
    currency: '€',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'IT',
    name: $t("global-1688-ai-app.country.ylargel", "意大利"),
    currency: '€',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'CA',
    name: $t("global-1688-ai-app.country.jnlarge", "加拿大"),
    currency: 'C$',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
    ],
  },
  {
    code: 'TH',
    name: $t("global-1688-ai-app.country.tg", "泰国"),
    currency: '฿',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'VN',
    name: $t("global-1688-ai-app.country.yn", "越南"),
    currency: '₫',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'MY',
    name: $t("global-1688-ai-app.country.mlxy", "马来西亚"),
    currency: 'RM',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'PH',
    name: $t("global-1688-ai-app.country.flb", "菲律宾"),
    currency: '₱',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'ID',
    name: $t("global-1688-ai-app.country.ydnxy", "印度尼西亚"),
    currency: 'Rp',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'SG',
    name: $t("global-1688-ai-app.country.newjp", "新加坡"),
    currency: 'S$',
    platforms: [
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
  {
    code: 'JP',
    name: $t("global-1688-ai-app.country.dayb", "日本"),
    currency: '¥',
    platforms: [
      {
        code: 'amazon',
        name: 'Amazon',
      },
      {
        code: 'tiktok',
        name: 'TikTok',
      },
    ],
  },
];

// 国家代码类型
export type TypeCountryCode = keyof typeof COUNTRY_MAP;

export const COUNTRY_OPTIONS = COUNTRY_MAP.map((country) => ({
  label: country.name,
  value: country.code,
}));

// 平台映射国家platform
export const PLATFORM_MAP = [
  {
    name: $t("global-1688-ai-app.country.ymx", "亚马逊"),
    code: 'amazon',
    platforms: [
      { code: 'US', name: $t("global-1688-ai-app.country.beautifulg", "美国"), currency: '$' },
      { code: 'GB', name: $t("global-1688-ai-app.country.yg", "英国"), currency: '£' },
      { code: 'ES', name: $t("global-1688-ai-app.country.xby", "西班牙"), currency: '€' },
      { code: 'FR', name: $t("global-1688-ai-app.country.fg", "法国"), currency: '€' },
      { code: 'DE', name: $t("global-1688-ai-app.country.dg", "德国"), currency: '€' },
      { code: 'IT', name: $t("global-1688-ai-app.country.ylargel", "意大利"), currency: '€' },
      { code: 'CA', name: $t("global-1688-ai-app.country.jnlarge", "加拿大"), currency: 'C$' },
      { code: 'JP', name: $t("global-1688-ai-app.country.dayb", "日本"), currency: '¥' },
    ]
  },
  {
    name: 'TikTok',
    code: 'tiktok',
    platforms: [
      { code: 'ID', name: $t("global-1688-ai-app.country.ydnxy", "印度尼西亚"), currency: 'Rp' },
      { code: 'VN', name: $t("global-1688-ai-app.country.yn", "越南"), currency: '₫' },
      { code: 'MY', name: $t("global-1688-ai-app.country.mlxy", "马来西亚"), currency: 'RM' },
      { code: 'TH', name: $t("global-1688-ai-app.country.tg", "泰国"), currency: '฿' },
      { code: 'PH', name: $t("global-1688-ai-app.country.flb", "菲律宾"),  currency: '₱' },
      { code: 'US', name: $t("global-1688-ai-app.country.beautifulg", "美国"), currency: '$' },
      { code: 'SG', name: $t("global-1688-ai-app.country.newjp", "新加坡"), currency: 'S$' },
      { code: 'BR', name: $t("global-1688-ai-app.country.bx", "巴西"), currency: 'R$' },
      { code: 'MX', name: $t("global-1688-ai-app.country.mxg", "墨西哥"), currency: '$' },
      { code: 'GB', name: $t("global-1688-ai-app.country.yg", "英国"), currency: '£' },
      { code: 'ES', name: $t("global-1688-ai-app.country.xby", "西班牙"), currency: '€' },
      { code: 'FR', name: $t("global-1688-ai-app.country.fg", "法国"), currency: '€' },
      { code: 'DE', name: $t("global-1688-ai-app.country.dg", "德国"), currency: '€' },
      { code: 'IT', name: $t("global-1688-ai-app.country.ylargel", "意大利"), currency: '€' },
      { code: 'JP', name: $t("global-1688-ai-app.country.dayb", "日本"), currency: '¥' },
    ]
  }
];

// 平台迁移的国家
export const PLATFORM_COUNTRIES = [
  { code: 'US', name: $t("global-1688-ai-app.country.beautifulg", "美国"), currency: '$' },
  { code: 'GB', name: $t("global-1688-ai-app.country.yg", "英国"), currency: '£' },
  { code: 'ES', name: $t("global-1688-ai-app.country.xby", "西班牙"), currency: '€' },
  { code: 'FR', name: $t("global-1688-ai-app.country.fg", "法国"), currency: '€' },
  { code: 'DE', name: $t("global-1688-ai-app.country.dg", "德国"), currency: '€' },
  { code: 'IT', name: $t("global-1688-ai-app.country.ylargel", "意大利"), currency: '€' },
  { code: 'CA', name: $t("global-1688-ai-app.country.jnlarge", "加拿大"), currency: 'C$' },
  { code: 'JP', name: $t("global-1688-ai-app.country.dayb", "日本"), currency: '¥' },
];