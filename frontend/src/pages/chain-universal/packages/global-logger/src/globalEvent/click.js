import Logger from "../index";
import {
  REPORT_SUB_BUSINESS,
  REPORT_PRIMARY_KEY,
  REPORT_ATTRIBUTE_CLK,
} from "../constant";
import getElAttr from "../utils/getElAttr";
const CLICK_INIT = 'clickInit';

const event = function (e) {
  // const ePosition = getElAttr(e, [ATTRIBUTE_ACTION_TYPE])
  const attsValue = getElAttr(e, {
    b: { name: REPORT_SUB_BUSINESS },
    c: { name: REPORT_PRIMARY_KEY },
    e: { name: REPORT_ATTRIBUTE_CLK },
  });
  if (attsValue && attsValue.e && attsValue.e.length>0) {
    Logger.report({
      d: "CLK",
      ...attsValue,
    });
  }
};

export default () => {
  if (Logger.getConfig(CLICK_INIT)) return;
  document.removeEventListener("click", event);
  document.addEventListener("click", event);
  Logger.setConfig(CLICK_INIT, true);
};
