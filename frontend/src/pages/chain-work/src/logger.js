import logger from '@alife/channel-uni-event-logger';

// 可视区域上报比例，默认50%
const VISIBLE_AREA_RADIO = 0.5;
// 上报信息所在的attribute名字
export const REPORT_ATTRIBUTE_NAME = 'data-channel-uni-logger-report-action';
// 已经进行过EXP上报
const HAS_EXP_REPORT_TAG_NAME = 'data-channel-uni-logger-exp';
// 要监听的DOM节点标示
export const ELE_ATTRIBUTE_NAME = 'data-channel-uni-logger-tracker';
// 可视化上报Type
const REPORT_ATTRIBUTE_TYPE_NAME = 'data-channel-uni-logger-gmkey';

export const { generateURL, setConfig, getConfig, autoPV: _autoPv } = logger;

export const report = ({ type, action, desc, status }) => {
  const reportData = {
    actionType: `${type}_${action}`,
    actionDesc: desc,
    actionStatus: status,
  };

  logger.report(reportData);
};

const getMonitorEles = (type) => {
  let monitorELes = [];
  if (type === 'EXP') {
    monitorELes = [
      ...document.querySelectorAll(
        `[${REPORT_ATTRIBUTE_NAME}]:not([${HAS_EXP_REPORT_TAG_NAME}]):not([${REPORT_ATTRIBUTE_TYPE_NAME}=clk])`,
      ),
    ];
  } else {
    monitorELes = [...document.querySelectorAll(`[${REPORT_ATTRIBUTE_NAME}]:not([${REPORT_ATTRIBUTE_TYPE_NAME}=exp])`)];
  }
  return monitorELes;
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
      observe();
    };
    // 创建一个观察器实例并传入回调函数
    const observer = new MutationObserver(callback);
    // 以上述配置开始观察目标节点
    observer.observe(targetNode, config);
    window.channelUniLoggerHasMutationObserver = true;
  }
};

const observeEXP = () => {
  // 如果有以前的IntersectionObserver，关闭掉，防止多次上报
  if (window && window.channelUniLoggerExpMonitor && window.channelUniLoggerExpMonitor.disconnect) {
    window.channelUniLoggerExpMonitor.disconnect();
    window.channelUniLoggerExpMonitor = null;
  }
  const channelUniLoggerExpMonitor = new IntersectionObserver(
    (entries) => {
      entries.forEach((item) => {
        if (item.intersectionRatio >= VISIBLE_AREA_RADIO) {
          const action = item.target.getAttribute(REPORT_ATTRIBUTE_NAME);
          const actionData = JSON.parse(action);
          // const logKey = getLogKey(item.target);
          if (action) {
            report({
              type: 'EXP',
              action: actionData.action,
              desc: actionData.offerId,
            });
            // 标注已经曝光
            item.target.setAttribute(HAS_EXP_REPORT_TAG_NAME, true);
            // 取消观察
            channelUniLoggerExpMonitor.unobserve(item.target);
          }
        }
      });
      setListener();
    },
    {
      threshold: VISIBLE_AREA_RADIO,
    },
  );
  window.channelUniLoggerExpMonitor = channelUniLoggerExpMonitor;
  const monitorEles = getMonitorEles('EXP');
  // 观察每个节点
  monitorEles.forEach((ele) => channelUniLoggerExpMonitor.observe(ele));
};

// 监听点击（注意：处理不了跳转的点击）
const observeCLK = () => {
  if (window && !window.channelUniLoggerClkMonitor) {
    // 监听整个页面的点击，在捕获阶段进行处理，尽早发出点击请求
    window.addEventListener(
      'click',
      (event) => {
        // 如果属于monitorEles中的某一项，就将target中的值上报
        // forEach不能break，所以重新改为for循环
        const monitorEles = getMonitorEles('CLK');
        for (let index = 0; index < monitorEles.length; index++) {
          const item = monitorEles[index];
          if (item.contains(event.target)) {
            const el = item.target || item;
            const action = el.getAttribute(REPORT_ATTRIBUTE_NAME);
            const actionData = JSON.parse(action);
            if (action) {
              report({
                type: 'CLK',
                action: actionData.action,
                desc: actionData.offerId,
              });
            }
            break;
          }
        }
      },
      true,
    );
    window.channelUniLoggerClkMonitor = true;
  }
};

export const observe = () => {
  observeEXP();
  observeCLK();
};

export const autoPV = () => {
  setTimeout(() => {
    window._channel_logger_send_pv = false;
    _autoPv();
  }, 500);
};

export const initLogger = (channelType) => {
  setConfig('channelType', channelType);
  observe();
  setListener();
  autoPV();
};
