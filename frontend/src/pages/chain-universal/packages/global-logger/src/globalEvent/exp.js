import {
  REPORT_SUB_BUSINESS,
  REPORT_PRIMARY_KEY,
  HAS_EXP_REPORT_TAG_NAME,
  REPORT_ATTRIBUTE_EXP,
} from "../constant";
import { getAttrs } from "../utils/getElAttr";

import Logger from "../index";

// 可视区域上报比例，默认50%
const VISIBLE_AREA_RADIO = 0.5;

const observeEXP = () => {
  // 如果有以前的IntersectionObserver，关闭掉，防止多次上报
  if (
    window &&
    window.channelUniLoggerExpMonitor &&
    window.channelUniLoggerExpMonitor.disconnect
  ) {
    window.channelUniLoggerExpMonitor.disconnect();
    window.channelUniLoggerExpMonitor = null;
  }
  const channelUniLoggerExpMonitor = new IntersectionObserver(
    (entries) => {
      entries.forEach((item) => {
        // console.log('item',item)
        if (item.intersectionRatio >= VISIBLE_AREA_RADIO) {
          const attsValue = getAttrs(item.target, {
            b: { name: REPORT_SUB_BUSINESS },
            c: { name: REPORT_PRIMARY_KEY },
            e: { name: REPORT_ATTRIBUTE_EXP },
          });
          // e位必须有值 否则不上报
          if (attsValue && attsValue.e && attsValue.e.length>0) {
            Logger.report({
              d: "EXP",
              ...attsValue,
            });
            // 标注已经曝光
            item.target.setAttribute(HAS_EXP_REPORT_TAG_NAME, true);
            // 取消观察
            channelUniLoggerExpMonitor.unobserve(item.target);
          }
        }
      });
    },
    {
      threshold: VISIBLE_AREA_RADIO,
    }
  );
  window.channelUniLoggerExpMonitor = channelUniLoggerExpMonitor;
  const monitorEles = getMonitorEles();
  // 观察每个节点
  monitorEles.forEach((ele) => channelUniLoggerExpMonitor.observe(ele));
};

const getMonitorEles = () => {
  return [
    ...document.querySelectorAll(
      `[${REPORT_PRIMARY_KEY}]:not([${HAS_EXP_REPORT_TAG_NAME}])[${REPORT_ATTRIBUTE_EXP}]`
    ),
  ];
};
export const setListener = () => {
  if (window && !window.channelUniLoggerHasMutationObserver) {
    // 选择需要观察变动的节点
    const targetNode = document.body;
    // 观察器的配置（需要观察什么变动）
    const config = {
      childList: true,
      subtree: true,
    };
    // 当观察到变动时执行的回调函数
    const callback = () => {
      observeEXP();
    };
    // 创建一个观察器实例并传入回调函数
    const observer = new MutationObserver(callback);
    // 以上述配置开始观察目标节点
    observer.observe(targetNode, config);
    window.channelUniLoggerHasMutationObserver = true;
  }
};
export default () => {
  setListener()
  return observeEXP
};
