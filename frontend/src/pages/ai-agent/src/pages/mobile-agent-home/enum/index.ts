
export enum AgentType {
  SELECT_PRODUCT = 'selectProduct',
  SELECT_SELLER = 'selectSeller',
  MATERIAL = 'material',
  INQUIRY = 'inquiry',
  COMMON_CHAT = 'commonChat',
}

// 模式类型枚举
export enum EnumSearchMode {
  // 智能模式
  SMART = 'AUTO',

  // 以品找商
  PRODUCT_TO_SUPPLIER = 'SEARCH_OFFER',

  // 找商
  DIRECT_SUPPLIER = 'SEARCH_PROVIDER',

  // 指名商家
  DIRECT_SEARCH_PROVIDER = 'DIRECT_SEARCH_PROVIDER',
  // 其他模式
  OTHER = 'OTHER',
}
