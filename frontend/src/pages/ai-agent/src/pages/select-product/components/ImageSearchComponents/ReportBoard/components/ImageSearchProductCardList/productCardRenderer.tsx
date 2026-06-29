import React from 'react';
import ProductAbstractInfo from "./components/ProductAbstractInfo";
import Product1688AbstractInfo from "./components/Product1688AbstractInfo";
import SameProductsInfo from "./components/SameProductsInfo";
import Summary from "./components/Summary";
import RatingReview from "./components/RatingReview";

export enum EnumProductCardType {
  PRODUCT_ABSTRACT_INFO = 'productAbstractInfo',
  PRODUCT_1688_ABSTRACT_INFO = 'product1688AbstractInfo',
  SAME_PRODUCTS_INFO = 'sameProductsInfo',
  SUMMARY = 'summary',
  PRODUCT_SUMMARY = 'productSummary',
  PRODUCT_IMPROVE_SUMMARY = 'productImproveSummary',
  PRODUCT_COMPARE_SUMMARY = 'productCompareSummary',
  PRODUCT_REVIEW_TAGS = 'productReviewTags',
}

export const ProductCardRendererMap = {
  [EnumProductCardType.PRODUCT_ABSTRACT_INFO]: ProductAbstractInfo,
  [EnumProductCardType.PRODUCT_1688_ABSTRACT_INFO]: Product1688AbstractInfo,
  [EnumProductCardType.SAME_PRODUCTS_INFO]: SameProductsInfo,
  [EnumProductCardType.SUMMARY]: Summary,
  [EnumProductCardType.PRODUCT_SUMMARY]: Summary,
  [EnumProductCardType.PRODUCT_IMPROVE_SUMMARY]: Summary,
  [EnumProductCardType.PRODUCT_COMPARE_SUMMARY]: Summary,
  [EnumProductCardType.PRODUCT_REVIEW_TAGS]: RatingReview,
};
// export enum EnumProductCardFormatType {
//   PRODUCT_SUMMARY = 'PRODUCT_SUMMARY',
//   PRODUCT_IMPROVE_SUMMARY = 'PRODUCT_IMPROVE_SUMMARY',
//   PRODUCT_COMPARE_SUMMARY = 'PRODUCT_COMPARE_SUMMARY',
// }

// export const formatParams = (parmas: any) => {
//   const { type } = parmas;
//   // switch (type) {
//   //   case EnumProductCardFormatType.PRODUCT_SUMMARY:
//   //     return {
//   //       ...parmas,
//   //       type: EnumProductCardType.PRODUCT_SUMMARY,
//   //     };
//   // }
//   return parmas;
// };

const defaultRenderer = (parmas: any) => {
  return null;
};
/**
 * 获取单元格渲染器
 * @param colType 列类型
 * @returns 对应的渲染器函数
 */
export const getProductCardRenderer = (params: any) => {
  const { type } = params;
  return ProductCardRendererMap[type] || null;
};

/**
 * 渲染单元格
 * 统一的单元格渲染入口
 */
export const renderProductCard = (params: any): React.ReactNode => {
  const Component = getProductCardRenderer(params);
  return Component ? <Component {...params} /> : null;
};