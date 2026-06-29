import type { SkuData, OrganizedSkuData, SkuAttribute } from "./types.d";

/**
 * 根据图片条件过滤属性
 * @param {Object} organizedData - 组织后的数据
 * @param {Function} condition - 过滤条件函数
 * @returns {Object} 过滤后的属性对象
 */
export function filterAttributesByImageCondition(
  organizedData: OrganizedSkuData,
  condition: (attr: SkuAttribute[]) => boolean
) {
  return Object.keys(organizedData).reduce((acc, key) => {
    if (condition(organizedData[key])) {
      acc[key] = organizedData[key];
    }
    return acc;
  }, {});
}

/**
 * 合并相同属性名的值
 * @param {Array} productAttributes - 产品属性数组，包含attributeName和value字段
 * @returns {Array} 合并后的属性数组，相同attributeName的value拼接
 */
export function mergeAttributeValues(productAttributes: { attributeName: string; value: string }[]): { attributeName: string; value: string }[] {
  // 合并相同属性名的值
  const mergedObj = productAttributes.reduce((acc, attr) => {
    const { attributeName, value } = attr;

    if (acc[attributeName]) {
      // 如果属性名已存在，将新值追加到现有值后面
      acc[attributeName] += `,${value}`;
    } else {
      // 如果属性名不存在，直接设置
      acc[attributeName] = value;
    }

    return acc;
  }, {});

  // 将对象转换回原始格式的数组
  return Object.entries(mergedObj).map(([attributeName, value]) => ({
    attributeName,
    value: String(value),
  }));
}

export function forSize(size: number) {
  return size * 1;
}
