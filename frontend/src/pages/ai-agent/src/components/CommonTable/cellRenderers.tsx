/**
 * 单元格渲染器
 * 使用策略模式管理不同类型的单元格渲染逻辑
 */

import React from 'react';
import { EnumColType } from './types';
import type { TypeTableHeader } from './types';
import Text from './TableCellComponent/Text';
import Image from './TableCellComponent/Image';
import TextIcon from './TableCellComponent/TextIcon';
import TrendLine from './TableCellComponent/TrendLine';
import TextList from './TableCellComponent/TextList';
import OppscoreCol from './TableCellComponent/OppscoreCol';
import TextApi from './TableCellComponent/TextApi';
/**
 * 渲染器参数类型
 */
export interface TypeCellRendererParams {
  /** 单元格值 */
  value: any;
  /** 行数据 */
  record: any;
  /** 行索引 */
  index: number;
  /** 列配置 */
  header: TypeTableHeader;
}


/**
 * 默认渲染器
 */
const renderDefaultCell = ({ value }) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return <span>{JSON.stringify(value)}</span>;
  return <span>{String(value)}</span>;
};

/**
 * 单元格渲染器映射表
 * 使用策略模式，根据 colType 选择对应的渲染器
 */
export const cellRendererMap = {
  [EnumColType.IMAGE]: Image,
  [EnumColType.TEXT]: Text,
  [EnumColType.TEXT_API]: TextApi,
  [EnumColType.TEXT_ICON]: TextIcon,
  [EnumColType.TREND_LINE]: TrendLine,
  [EnumColType.TEXT_LIST]: TextList,
  [EnumColType.OPP_SCORE]: OppscoreCol,
  // [EnumColType.TEXT_LINK_COLLAPSE]: renderTextLinkCollapseCell,
  // [EnumColType.TEXT_LIST]: renderTextListCell,
};

/**
 * 获取单元格渲染器
 * @param colType 列类型
 * @returns 对应的渲染器函数
 */
export const getCellRenderer = (colType: string) => {
  return cellRendererMap[colType] || renderDefaultCell;
};

/**
 * 渲染单元格
 * 统一的单元格渲染入口
 */
export const renderCell = (params: TypeCellRendererParams): React.ReactNode => {
  const { header } = params;
  const Component = getCellRenderer(header.colType);
  return Component ? <Component {...params} /> : null;
};
