// // 颜色常量定义 - 所有颜色值的唯一来源
import { DESIGN_TOKENS } from '@/styles/design-tokens';

// 从新设计系统映射到旧的命名约定，保持向后兼容
export const COLORS = {
  // 品牌色 - 更新为统一的橙色系
  "core-color": DESIGN_TOKENS.colors.brand.primary,           // "#6150FF"
  "primary-active-bg-color": DESIGN_TOKENS.colors.brand.primary,                       // 保持原有颜色（待确认是否需要更新）
  "brand-color": DESIGN_TOKENS.colors.brand.primary,         // 使用统一主色
  "brand-color-25": "rgba(255, 255, 255, 0.4)",                // 基于新主色的透明度版本
  "brand-color-45": "rgba(255, 255, 255, 0.6)",                // 基于新主色的透明度版本

  // 文字颜色 - 映射到新的设计系统
  "main-font-color": DESIGN_TOKENS.colors.text.primary,      // "#1D2129"
  "sub-font-color": DESIGN_TOKENS.colors.text.secondary,     // "#7B7B8D"
  "light-font-color": DESIGN_TOKENS.colors.text.tertiary,    // "#CCCCD4"
  "weak-font-color": "rgba(0, 0, 0, 0.3)",                   // 保持原有值
  "weak2-font-color": "rgba(0, 0, 0, 0.2)",                  // 保持原有值

  // 边框和背景色 - 映射到新的设计系统
  "light-border-color": DESIGN_TOKENS.colors.border.primary, // "#E7E8EE"
  "bg-color": "rgba(0, 0, 0, 0.08)",                         // 保持原有值
  "light-bg-color": DESIGN_TOKENS.colors.background.secondary, // "#FBFBFD"
  "mask-color": DESIGN_TOKENS.colors.background.overlay,     // "rgba(0, 0, 0, 0.4)"

  // 兼容 - 映射到新的状态色
  "studio-success-color": DESIGN_TOKENS.colors.status.success,  // "#22AC60"
  "studio-error-color": DESIGN_TOKENS.colors.status.error,      // "#F54A45"
  "studio-info-color": DESIGN_TOKENS.colors.status.info,        // "#1890FF"
  "studio-primary-color-outline": DESIGN_TOKENS.colors.brand.primaryLight, // "#FFF3EB"
} as const;

// 新增：推荐使用的颜色快捷访问
export const UNIFIED_COLORS = {
  // 直接导出新设计系统的颜色，推荐在新代码中使用
  ...DESIGN_TOKENS.colors.brand,
  ...DESIGN_TOKENS.colors.text,
  ...DESIGN_TOKENS.colors.background,
  ...DESIGN_TOKENS.colors.border,
  ...DESIGN_TOKENS.colors.status,
} as const;

// // 直接生成CSS变量，无需转换
// export const CSS_VARIABLES = Object.entries(COLORS).reduce(
//   (acc, [key, value]) => {
//     acc[`--${key}`] = value;
//     return acc;
//   },
//   {} as Record<string, string>
// );
