import globalEvent from "./globalEvent";
import setAplus from "./utils/setAplus";
import sessionId from "./meta/sessionId";
import {
  LOGGER_CONFIG,
  CONFIG_TYPE,
  QUERY_SESSIONID,
  QUERY_MAP,
} from "./constant";
import * as register from "@alife/channel-uni-register";
import qs from "query-string";
import RrwebRecorder from "./errorRecord/rrweb";
import slsReporter from "./utils/slsTracker";

const globalLogger = {
  init: function (initData, aplusParams = {}, cb = () => {}) {
    setAplus(aplusParams).then(() => {
      this.mainData.set(initData);
      this.setConfig(CONFIG_TYPE.SESSIONID, sessionId()); // 从url拿或者生成一个
      globalEvent();
      this.autoPV();
      cb();
    });
  },
  mainData: {
    _a: null,
    _b: null,
    _c: null,
    set({ a, b, c }) {
      this._a = a ? a : this._a;
      this._b = b ? b : this._b;
      this._c = c ? c : this._c;
    },
    get(key) {
      return this[`_${key}`];
    },
    getAll() {
      return {
        a: this._a,
        b: this._b,
        c: this._c,
      };
    },
  },
  reportByManual: function (params) {
    this.report({
      d: "EXP",
      ...params,
    });
  },
  report: function (_data, ifIgnoreA = false) {
    // 是否忽略a
    if (!_data) return;
    const data = Object.assign(this.mainData.getAll(), _data);
    // 如果不忽略a，则必须有a
    if (!ifIgnoreA && !data.a) {
      return;
    }
    // console.log("mainData --> ", data);
    const res = [];
    ["a", "b", "c", "d", "e", "f"].forEach((key) => {
      let posValue = data[key];
      if (!posValue) return;
      res.push(`g_uni_logger_${key}=${posValue}`);
    });
    const sessionId = this.getConfig(CONFIG_TYPE.SESSIONID);
    res.push(`${CONFIG_TYPE.SESSIONID}=${sessionId}`);
    res.push(`${CONFIG_TYPE.TIMESTAMP}=${Date.now()}`);

    let str = res.join("&");
    if (window.goldlog) {
      window.goldlog.record(
        "/1688_channel_fe.uni_logger.global_logger",
        "OTHER",
        str + "&_g_encode=utf-8"
      );
    }
    slsReporter({ log: str }, false);
  },
  setConfig: (key, value) => {
    register.set(LOGGER_CONFIG, {
      ...register.get(LOGGER_CONFIG),
      [key]: value,
    });
  },
  getConfig: (key) => {
    const config = register.get(LOGGER_CONFIG);
    if (key === undefined) return config;
    if (!config) return null;
    return config[key];
  },
  generateURL: function (url, query) {
    const sessionId = this.getConfig(CONFIG_TYPE.SESSIONID);
    const _url = new URL(url);
    const parseData = qs.parseUrl(_url.search);
    parseData.query[QUERY_SESSIONID] = sessionId;
    if (query) {
      Object.keys(query).forEach((key) => {
        if (QUERY_MAP[key]) parseData.query[QUERY_MAP[key]] = query[key];
      });
    }
    _url.search = decodeURIComponent(qs.stringifyUrl(parseData));
    return _url.href;
  },
  autoPV: function () {
    const crtB = this.mainData.get("b");
    // 检查b是否发送过pv  以b的维度去发送
    if (
      !window._global_logger_send_pv ||
      window._global_logger_send_pv !== crtB
    ) {
      // console.log("enter", this.mainData.get("b"));
      this.report(
        {
          d: "OTHER",
          e: "浏览",
        },
        true
      );

      setTimeout(() => {
        window._global_logger_send_pv = crtB;
      }, 1);
    }
    // 设置监听(对spa来说，只设置一次)
    if (!window._global_logger_send_pv) {
      window._global_logger_is_init_unload_event = crtB;
      window.addEventListener("beforeunload", () => {
        this.report(
          {
            d: "OTHER",
            e: "离开",
          },
          true
        );
      });
      window.addEventListener("hashchange", () => {
        const _crtB = this.mainData.get("b"); // 监听这里要重新写获取
        if (
          !window._global_logger_is_init_unload_event ||
          window._global_logger_is_init_unload_event !== _crtB
        ) {
          // console.log("leave", window._global_logger_is_init_unload_event);
          this.report(
            {
              b: window._global_logger_is_init_unload_event,
              d: "OTHER",
              e: "离开",
            },
            true
          );
        }
        window._global_logger_is_init_unload_event = _crtB;
      });
    }
  },
  RrwebRecorder: RrwebRecorder,
  reportToSls: function (zip_body, err) {
    const sessionId = this.getConfig(CONFIG_TYPE.SESSIONID);
    slsReporter({ sessionId, rrwebRecordBody: zip_body, errorBody: err }, true);
  },
};
// 自动初始化
if (window.globalLogger_queue) {
  const q = window.globalLogger_queue;
  if (Array.isArray(q) && q.length > 0) {
    const { action, value, aplusParams = {}, cb = () => {} } = q[0];
    globalLogger[action](value, aplusParams, cb);
  }
}

export default globalLogger;
