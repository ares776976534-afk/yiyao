import { type MouseEvent } from 'react';
import { type NavBarProps } from 'antd-mobile';

export type MoreItem = {
  id: string;
  iconClass: string;
  /**
   * 跳转链接，如果传入，则会使用jsb的goto打开。
   * 如果要自定义处理点击的事件，请传入onClick
   */
  url?: string;
  onClick?: (current: MoreItem, e: MouseEvent<HTMLDivElement>) => void;
};

export type MobileNavigatorProps = {
  /**
   * 是否启用sticky
   */
  sticky?: boolean;
  /**
   * 是否有安全区
   */
  hasSafeArea?: boolean;
  moreItems?: MoreItem[];
  onShareClick?: () => void;
} & NavBarProps;