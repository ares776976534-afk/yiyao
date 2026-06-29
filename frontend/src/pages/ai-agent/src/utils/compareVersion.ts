type TypeCompareOperator = '>' | '>=' | '=' | '<' | '<=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte';

/**
 * 比较两个版本号
 * @param v1 版本号1，如 '1.11.0'
 * @param operator 比较操作符：'>' | '>=' | '=' | '<' | '<='
 * @param v2 版本号2，如 '1.2.0'
 * @returns 比较结果
 * @example
 * compareVersion('1.11.0', '>', '1.2.0');  // true
 * compareVersion('1.2.0', '=', '1.2.0');   // true
 * compareVersion('1.0.0', '<', '2.0.0');   // true
 */
export default (v1: string = '', operator: TypeCompareOperator = '>=', v2: string = ''): boolean => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const maxLen = Math.max(parts1.length, parts2.length);

  let result: -1 | 0 | 1 = 0;

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) {
      result = 1;
      break;
    }
    if (num1 < num2) {
      result = -1;
      break;
    }
  }

  switch (operator) {
    case '>': case 'gt':
      return result === 1;
    case '>=': case 'gte':
      return result >= 0;
    case '=': case 'eq':
      return result === 0;
    case '<': case 'lt':
      return result === -1;
    case '<=': case 'lte':
      return result <= 0;
    default:
      return false;
  }
};
