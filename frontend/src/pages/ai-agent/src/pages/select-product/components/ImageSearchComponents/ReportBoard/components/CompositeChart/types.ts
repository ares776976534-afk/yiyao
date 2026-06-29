// 图表数据项的基础类型
export interface TypeChartDataItem {
  categoryItem1?: string;
  categoryItem2?: string;
  end?: string;
  start?: string;
  XTitle?: string;
  unit?: string;
}

// 可选的图表数据项类型
export interface TypeOptionalChartDataItem {
  categoryItem1?: string;
  categoryItem2?: string;
  end?: string;
  start?: string;
  XTitle?: string;
  unit?: string;
}

// 数据点类型
export interface TypeDataPoint {
  x?: string;
  y?: number;
}

// 系列数据类型
export interface TypeSeriesData {
  categoryItem1?: string;
  categoryItem2?: string;
  dataPoints?: TypeDataPoint[];
  XUnit?: string;
  YUnit?: string;
}

// 评分范围图表类型
export interface TypeRatingRangeChart {
  dataItems?: TypeChartDataItem[];
  title?: string;
}

// 销售趋势图表类型
export interface TypeSalesTrendChart {
  XAxis?: string[];
  series?: TypeSeriesData[];
  title?: string;
}

// 库存图表类型
export interface TypeInStockChart {
  dataItems?: TypeOptionalChartDataItem[];
  title?: string;
}

// 价格范围图表类型
export interface TypePriceRangeChart {
  dataItems?: TypeOptionalChartDataItem[];
  title?: string;
}

// 销售数据类型
export interface TypeSalesData {
  ratingRangeChart?: TypeRatingRangeChart;
  salesTrendChart?: TypeSalesTrendChart;
}

// 供给数据类型
export interface TypeSupplyData {
  inStockChart?: TypeInStockChart;
  priceRangeChart?: TypePriceRangeChart;
}

// 原始数据类型
export interface TypeCompositeChartRawData {
  countryOptions?: string[];
  platformOptions?: string[];
  salesData?: TypeSalesData;
  supplyData?: TypeSupplyData;
}

// CompositeChart组件的Props类型
export interface TypeCompositeChartProps {
  rawData?: TypeCompositeChartRawData;
}
