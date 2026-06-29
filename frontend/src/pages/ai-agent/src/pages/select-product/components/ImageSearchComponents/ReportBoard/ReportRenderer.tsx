import React from 'react';
import Summary from "./components/Summary";
import TableList from "./components/TableList";
import ImageSearchProductCardList from "./components/ImageSearchProductCardList";
import CompositeChart from './components/CompositeChart';

export enum EnumReportBoardType {
  IMAGE_SEARCH_SUMMARY = 'IMAGE_SEARCH_SUMMARY',
  PRODUCT_LIST_IMAGE_SEARCH_BENCH_PRODUCT = 'PRODUCT_LIST_IMAGE_SEARCH_BENCH_PRODUCT',
  PRODUCT_LIST_IMAGE_SEARCH_ANALYSIS_PRODUCT_CARD = 'PRODUCT_LIST_IMAGE_SEARCH_ANALYSIS_PRODUCT_CARD',
  IMAGE_SEARCH_MARKET_DETAIL_INFO_REPORT = 'IMAGE_SEARCH_MARKET_DETAIL_INFO_REPORT',
}

export const ModuleRendererMap = {
  [EnumReportBoardType.IMAGE_SEARCH_SUMMARY]: Summary,
  [EnumReportBoardType.PRODUCT_LIST_IMAGE_SEARCH_BENCH_PRODUCT]: CompositeChart,
  [EnumReportBoardType.IMAGE_SEARCH_MARKET_DETAIL_INFO_REPORT]: TableList,
  [EnumReportBoardType.PRODUCT_LIST_IMAGE_SEARCH_ANALYSIS_PRODUCT_CARD]: ImageSearchProductCardList,
};

/**
 * 获取单元格渲染器
 * @param colType 列类型
 * @returns 对应的渲染器组件
 */
export const getReportRenderer = (params: any) => {
  const { cardType, cardSubType } = params;
  let type = cardType;
  if (cardSubType) {
    type = `${cardType}_${cardSubType}`;
  }
  return ModuleRendererMap[type] || null;
};

/**
 * 渲染单元格
 * 统一的单元格渲染入口
 * 使用 JSX 创建元素，而不是直接调用组件函数
 */
export const renderReport = (params: any): React.ReactNode => {
  const Component = getReportRenderer(params);
  return Component ? <Component {...params} /> : null;
};