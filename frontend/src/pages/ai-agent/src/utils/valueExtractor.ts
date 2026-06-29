/**
 * 根据valueType类型提取对应的值
 * @param data 包含valueType和value的对象
 * @returns 根据valueType返回对应的值
 */
export function getValue(data: any): string | undefined {
  if (!data) return undefined;

  if (data.valueType === 'STRING') {
    return data?.value;
  }

  if (data.valueType === 'MONEY') {
    return data?.value?.amountWithSymbol;
  }

  return data?.value;
}
