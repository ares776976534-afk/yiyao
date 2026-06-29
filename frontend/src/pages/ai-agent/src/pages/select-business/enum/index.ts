//  标签样式枚举
export enum EnumTagStyle {
  // 超级工厂
  SUPER_FACTORY = 'SUPER_FACTORY',
  // 源头工厂
  SOURCE_FACTORY = 'SOURCE_FACTORY',
  // 实力商家
  POWER_FACTORY = 'POWER_FACTORY',
  // 一般工厂
  GENERAL = 'GENERAL',
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