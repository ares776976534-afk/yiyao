import SlsTracker from "@aliyun-sls/web-track-browser";
import { initParams } from "./sls";
let timerCount = 0;
let tracker_log;
let tracker_rrweb;

const generateSls = (logType = "log") => {
  let str = "global_fe_logger";
  if (logType === "rrweb") {
    str += "_rrweb";
  }
  const appName = "cbu-national-platform/" + str;
  const type = str;
  let _params = null;
  const params = {
    appname: appName,
    type,
    cna: "",
    userinfo: {
      userid: "",
      userloginid: "",
      usermemberid: "",
    },
    spmfrom: "",
    spmcurrent: "",
  };

  try {
    _params = initParams(params);
  } catch (e) {
    _params = {
      ...params,
      error: e,
    };
  }

  const slsTracker = new SlsTracker({
    host: "cn-hangzhou.log.aliyuncs.com", // 所在区域的host
    project: "cbu-national-platform", // project名称
    logstore: type, // logstore名称
    topic: "topic",
    source: "source",
    tags: {
      tags: "tags",
    },
  });
  return { slsTracker, params: _params };
};

const poll = () => {
  if (
    !tracker_log ||
    tracker_log.params.spmcurrent?.length === 0 ||
    tracker_log.params.spmcurrent.endsWith("null") ||
    tracker_log.params.spmcurrent.endsWith(".0")
  ) {
    tracker_log = generateSls("log");
    tracker_rrweb = generateSls("rrweb");
  }
  // 检查是否已经轮询了五次
  if (++timerCount === 5) {
    return;
  }
  // 设置下一次轮询
  setTimeout(poll, 1000);
};
poll();


export default (data, isRrweb = false) => {
  if (!data) {
    return;
  }
  // const _report = isRrweb ? tracker_rrweb : tracker_log;
  const { slsTracker, params } = isRrweb ? tracker_rrweb : tracker_log;

  const { hostname } = window.location;
  if (hostname.includes("-test") || hostname.includes("localhost")) {
    return;
  }
  const nonNullable = Object.keys(data).reduce((acc, key) => {
    if (data[key] != null) {
      acc[key] = data[key];
    }
    return acc;
  }, {});
  const _data = {
    ...params,
    ...nonNullable,
  };
  slsTracker.sendImmediate(_data);
};
