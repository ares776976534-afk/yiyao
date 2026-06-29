import QwenTakeaway from './QwenTakeaway';
import QwenCite from './QwenCite';
import QwenSentimentAnalysis from './QwenSentimentAnalysis';
// import QwenMarketAnalysis from './QwenMarketAnalysis';
import QwenReview from './QwenReview';
import QwenOfferCard from './QwenOfferCard';
import Table from './components/Table';
import type { TypeComponentRegistry } from './types';
import TrendAnalysis from './TrendAnalysis';
import QwenWebSearch from './QwenWebSearch';
import QwenMarketAnalysi from './QwenMarketAnalysi';
import QwenOfferCar from './QwenOfferCar';

// 导出组件
export { default as QwenTakeaway } from './QwenTakeaway';
export { default as QwenCite } from './QwenCite';
export { default as QwenSentimentAnalysis } from './QwenSentimentAnalysis';
// export { default as QwenMarketAnalysis } from './QwenMarketAnalysis';
export { default as QwenReview } from './QwenReview';
export { default as QwenOfferCard } from './QwenOfferCard';
export { default as Table } from './components/Table';
export { default as QwenWebSearch } from './QwenWebSearch';
export { default as QwenMarketAnalysi } from './QwenMarketAnalysi';
export { default as QwenOfferCar } from './QwenOfferCar';
export * from './types';

// 默认组件注册表配置
// 新增组件时，在此处添加映射关系即可
// 配置说明：
// - renderAs: 'inline' 内联元素（转换为 <a>/<span>，不换行）| 'block' 块级元素（转换为 <div>，换行）
// - tagName: 转换后的 HTML 标签名
// - className: 添加到转换后标签的 class 名称
export const defaultComponents: TypeComponentRegistry = {
  'qwen:takeaway': {
    component: QwenTakeaway,
    renderAs: 'block',
    tagName: 'div',
  },
  'qwen:cite': {
    component: QwenCite,
    renderAs: 'inline',
    tagName: 'a',
    className: 'qwen-cite',
  },
  competition_analysis: {
    component: QwenMarketAnalysi,
    renderAs: 'block',
    tagName: 'div',
  },
  trend_analysis: {
    component: TrendAnalysis,
    renderAs: 'block',
    tagName: 'div',
  },
  sentiment_analysis: {
    component: QwenReview,
    renderAs: 'block',
    tagName: 'div',
  },
  product_recommend: {
    component: QwenOfferCar,
    renderAs: 'block',
    tagName: 'div',
  },
  custom_table: {
    component: Table,
    renderAs: 'block',
    tagName: 'div',
  },
  qwen_web_search: {
    component: QwenWebSearch,
    renderAs: 'inline',
    tagName: 'span',
  },
};

