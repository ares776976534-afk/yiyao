import type { TypeTagOption } from "./types";

export enum EnumPageStatus {
  INIT = "init",
  LOADING = "loading",
  RESULT = "result",
}

export enum EnumLanguage {
  EN = "en",
  KO = "ko",
  JA = "ja",
  RU = "ru",
}

export enum EnumPlatform {
  AMAZON = "amazon",
  TEMU = "temu",
  SHOPEE = "shopee",
  OZON = "ozon",
}

export const DEFAULT_PLATFORM = EnumPlatform.AMAZON;
export const DEFAULT_LANGUAGE = EnumLanguage.EN;

export const POST_MESSAGE_NAMESPACE = "od-studio";

export enum EnumPostMessageType {
  OPEN_DRAWER = "openDrawer",
  CLOSE_DRAWER = "closeDrawer",
  DRAWER_STATE_CHANGE = "drawerStateChange",
}

// postMessage 安全白名单，支持通配符（如 https://*.1688.com）
const ALLOWED_ORIGINS = [
  location.origin,
  "https://detail.1688.com",
  "http://localhost:*", // 本地开发测试
];

function allowOrigin(origin: string) {
  return ALLOWED_ORIGINS.some((allowed) => {
    const pattern = allowed.replace(/\./g, "\\.").replace(/\*/g, ".*?");
    return new RegExp(`${pattern}$`).test(origin);
  });
}

// 校验 origin 白名单 + namespace 匹配 + type 在枚举范围内
export function isAllowedMessage(origin: string, data: unknown): boolean {
  if (!allowOrigin(origin)) return false;
  const msg = data as Record<string, unknown>;
  if (msg?.namespace !== POST_MESSAGE_NAMESPACE) return false;
  return Object.values(EnumPostMessageType).includes(
    msg?.type as EnumPostMessageType,
  );
}

export const PLATFORM_OPTIONS: TypeTagOption[] = [
  {
    key: EnumPlatform.AMAZON,
    label: "亚马逊",
    icon: "https://img.alicdn.com/imgextra/i1/O1CN01whORxP1NcGsHRxGyU_!!6000000001590-55-tps-16-16.svg",
  },
  {
    key: EnumPlatform.TEMU,
    label: "Temu",
    icon: "https://img.alicdn.com/imgextra/i4/O1CN01MBCGtT1VMiLbGh008_!!6000000002639-55-tps-16-16.svg",
  },
  {
    key: EnumPlatform.SHOPEE,
    label: "Shopee",
    icon: "https://img.alicdn.com/imgextra/i3/O1CN01yrm2M92ADSaiEiIrn_!!6000000008169-55-tps-16-16.svg",
  },
  {
    key: EnumPlatform.OZON,
    label: "OZON",
    icon: "https://img.alicdn.com/imgextra/i1/O1CN01LJ3j391eSyIswarnF_!!6000000003871-2-tps-88-88.png",
    supportedLanguages: [EnumLanguage.RU],
  },
];

export const LANGUAGE_OPTIONS: TypeTagOption[] = [
  { key: EnumLanguage.EN, label: "英文" },
  { key: EnumLanguage.KO, label: "韩语" },
  { key: EnumLanguage.JA, label: "日语" },
  { key: EnumLanguage.RU, label: "俄语" },
];

export const REGION_TO_LANGUAGE_MAP: Record<string, EnumLanguage> = {
  US: EnumLanguage.EN,
  JP: EnumLanguage.JA,
  KR: EnumLanguage.KO,
  RU: EnumLanguage.RU,
};
