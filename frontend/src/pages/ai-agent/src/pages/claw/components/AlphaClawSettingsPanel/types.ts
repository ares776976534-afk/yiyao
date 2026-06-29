/** AlphaClaw 设置面板相关类型 */

export interface TypeAlphaClawSettingsPanelProps {
  /** 会话/实例 ID，用于展示 */
  sessionId?: string;
  /** 关闭回调 */
  onClose?: () => void;
  /** 打开时默认选中的 tab（如从连接前检测到未配置模型时定位到模型设置） */
  defaultActiveMenu?: TypeAlphaClawSettingsMenuId;
}

export type TypeAlphaClawSettingsMenuId =
  | "basic"
  | "personal"
  | "auth"
  | "model"
  | "chatTool"
  | "credits"
  | "creditsPurchase";

/** 账号授权 - 渠道枚举 */
export type TypeAuthChannel = "Ozon" | "Shopee" | "Amazon";

/** 账号授权 - 单条账号信息（下游店铺） */
export interface TypeAuthAccount {
  id: string;
  /** 渠道，如 Ozon、Shopee、Amazon */
  channel: TypeAuthChannel | string;
  /** 店铺名称 */
  shopName: string;
  /** 账号标识 */
  accountId: string;
  /** 授权时间，展示用 yyyy-MM-dd */
  authTime: string;
}

/** 账号授权 - 新增账号表单 */
export interface TypeAuthFormValues {
  channel: TypeAuthChannel | string;
  shopName: string;
  appKey: string;
  clientId: string;
}

/** 账号授权 - 当前展示视图 */
export type TypeAuthView = "empty" | "list";

/** 平台账号 - 接口返回的单条数据格式 */
export interface TypePlatformAccount {
  skillKey: string;
  channel: TypeAuthChannel | string;
  shopName: string;
  shopIdentifier: string;
  enabled: boolean;
  credentials: Record<string, string>;
  authorizedTime: string;
}

/** 平台账号 - 新增接口入参（与列表单条元素字段一致） */
export interface TypePlatformAddPayload {
  channel: TypeAuthChannel | string;
  shopName: string;
  shopIdentifier: string;
  enabled: boolean;
  credentials: Record<string, string>;
}

/** 聊天工具类型 */
export type TypeChatToolKind = "wechat" | "feishu" | "dingtalk" | "qq";

/** 微信绑定配置 - 扫码绑定，无表单 credentials；connected 为渠道绑定状态 */
export interface TypeWechatBinding {
  enabled: boolean;
  connected: boolean;
}

/** 飞书绑定配置 - credentials: appId, appSecret */
export interface TypeFeishuBinding {
  enabled: boolean;
  appId: string;
  appSecret: string;
}

/** 钉钉绑定配置 - credentials: clientId, clientSecret, robotCode(必填), corpId, agentId(可选) */
export interface TypeDingtalkBinding {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  robotCode: string;
  corpId: string;
  agentId?: string;
}

/** QQ 绑定配置 - credentials: appId, clientSecret */
export interface TypeQQBinding {
  enabled: boolean;
  appId: string;
  clientSecret: string;
}

/** 聊天工具保存载荷 - 与接口 body 的 credentials 结构一致 */
export interface TypeChatToolSavePayload {
  wechat?: Record<string, never>;
  feishu?: { appId: string; appSecret: string };
  dingtalk?: {
    clientId: string;
    clientSecret: string;
    robotCode: string;
    corpId: string;
    agentId?: string;
  };
  qq?: { appId: string; clientSecret: string };
}

/** 接口：单条 channel 配置（get 返回 / save 提交） */
export interface TypeChatToolChannelItem {
  channelName: "openclaw-weixin" | "feishu" | "dingtalk" | "qqbot";
  displayName: string;
  enabled: boolean;
  /** 微信等渠道：是否已完成账号绑定 */
  connected?: boolean;
  accountId?: string;
  credentials: Record<string, string>;
}

/** 接口：getChatToolConfig 返回结构 */
export interface TypeChatToolConfigResult {
  channels: TypeChatToolChannelItem[];
}

/** 模型设置 - 默认配置展示（只读） */
export interface TypeModelDefaultInfo {
  totalCredits: number;
  freeCredits: number;
  rechargeCredits: number;
  modelName: string;
  apiKeyMasked: string;
  baseUrl: string;
}

/** 模型设置 - 自定义配置表单 */
export interface TypeModelCustomForm {
  modelName: string;
  apiKey: string;
  baseUrl: string;
  apiType: string;
}

/** 面板主视图：设置 | 积分明细 | 终端 */
export type TypePanelView = "settings" | "creditsDetail" | "terminal";

/** 积分消耗单条记录 */
export interface TypeCreditsRecord {
  callTime: string;
  amount: number;
}

/** 个性化设置 - soul.md 内容（表单/接口字段 soul） */
export interface TypePersonalConfig {
  soul?: string;
}

/** 积分筛选类型 */
export type TypeCreditsFilter = "all" | "consume" | "earn";

/** 积分概览 */
export interface TypeCreditsSummary {
  currentCredits: number;
  freeCredits: number;
  freeCreditsTotal: number;
  purchasedCredits: number;
}

/** 积分明细 */
export interface TypeCreditsRecordItem {
  id: string;
  category: Exclude<TypeCreditsFilter, "all">;
  title: string;
  happenedAt: string;
  amount: number;
  expireAt?: string;
}
