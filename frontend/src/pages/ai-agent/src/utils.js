export const Logger = {
  init(initData, aplusParams) {
    if (aplusParams && !aplusParams.appKey) aplusParams.appKey = 'a2639r';
    if (window.globalLogger) {
      window.globalLogger.init(initData, aplusParams);
      this.getRrwebRecorder();
    } else {
      const globalLogger_queue = window.globalLogger_queue || (window.globalLogger_queue = []);
      globalLogger_queue.push({
        action: 'init',
        value: {
          ...initData,
        },
        aplusParams,
        cb: () => {
          this.getRrwebRecorder();
        },
      });
    }
  },
  report(data) {
    if (window.globalLogger) {
      window.globalLogger.reportByManual(data);
    }
  },
  getLogger() {
    return window.globalLogger;
  },
  // 若有录制实例直接返回，否则初始化/开始录制
  getRrwebRecorder() {
    if (window.rrwebRecorder) return window.rrwebRecorder;
    if (window.globalLogger) {
      const rrwebRecorder = new window.globalLogger.RrwebRecorder();
      console.log('start logging---');
      rrwebRecorder.startRecord();
      window.rrwebRecorder = rrwebRecorder;
      return rrwebRecorder;
    }
    return null;
  },
  saveRecord(err) {
    const rrwebRecorder = this.getRrwebRecorder();
    if (!rrwebRecorder) return () => { };
    rrwebRecorder.saveRecord(err);
  },
};