import {
  REPORT_ATTRIBUTE_CLK,
} from "../constant";

export default (e, attrs) => {
  let values = null;

  if (e && e.target) {
    const _target = e.target;

    if (!_target) return null;

    if (_target.closest) {
      // const ancestorSelector = Object.values(attrs)
      //   .map((attr) => `[${attr.name}]`)
      //   .join("");
      const ancestorSelector = `[${REPORT_ATTRIBUTE_CLK}]`
      const el = _target.closest(ancestorSelector);
      values = getAttrs(el, attrs);
    } else {
      values = getAttrs(_target, attrs);
    }
  }
  return values;
};

export const getAttrs = (el, attrs) => {
  if (!el) return null;

  const res = {};
  Object.keys(attrs).forEach((pos) => {
    const attrName = attrs[pos].name;
    const value = el.getAttribute(attrName);
    if (value) {
      res[pos] = value;
    }
  });
  return res;
};
