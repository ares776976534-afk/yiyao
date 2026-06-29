import type { ReactNode } from 'react';

/** 轮播方向：后牌前移 vs 前牌后移 */
export const EnumStackRotateDirection = {
  /** 最底层一张先「冒出」，再轮到最前（默认，原逻辑） */
  BACK_TO_FRONT: 'backToFront',
  /** 最前一张先「冒出」，再轮到最后 */
  FRONT_TO_BACK: 'frontToBack',
} as const;

export type TypeStackRotateDirection =
  (typeof EnumStackRotateDirection)[keyof typeof EnumStackRotateDirection];

/** 冒出方向（相对当前卡位的额外位移） */
export const EnumStackEmergeFrom = {
  /** 从上方（translateY 更负） */
  TOP: 'top',
  /** 从下方（translateY 更正） */
  BOTTOM: 'bottom',
} as const;

export type TypeStackEmergeFrom =
  (typeof EnumStackEmergeFrom)[keyof typeof EnumStackEmergeFrom];

export interface TypeProps {
  dataSource?: ReactNode[];
  /** 与 od 页面兼容，当前组件未展示文案时可忽略 */
  platformLabel?: string;
  /** 一轮动画周期（含停留），默认 2800ms */
  intervalMs?: number;
  /** 冒出阶段时长，默认 520ms */
  emergeDurationMs?: number;
  /** 卡片轮换方向，默认后牌前移 */
  stackRotateDirection?: TypeStackRotateDirection;
  /** 冒出方向：从堆叠面上方或下方，默认上方 */
  stackEmergeFrom?: TypeStackEmergeFrom;
}
