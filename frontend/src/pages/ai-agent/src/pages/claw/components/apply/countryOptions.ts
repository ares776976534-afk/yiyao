import { countryNamesZhSorted } from './countryNamesZhSorted';

/** 主要经营国家下拉：label/value 均为中文国名，顺序与数据文件一致（已按拼音排序） */
export default countryNamesZhSorted.map((name) => ({
  label: name,
  value: name,
}));
