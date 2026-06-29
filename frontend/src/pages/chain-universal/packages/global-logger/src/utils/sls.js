function stringify(obj) {
  if (window.JSON && window.JSON.stringify) {
    return JSON.stringify(obj);
  }
  let t = typeof (obj);
  if (t != 'object' || obj === null) {
    if (t == 'string') obj = `"${obj}"`;
    return String(obj);
  } else {
    let n; let v; const json = []; const
      arr = (obj && obj.constructor == Array);
    const self = arguments.callee;

    for (n in obj) {
      v = obj[n];
      t = typeof (v);
      if (obj.hasOwnProperty(n)) {
        if (t == 'string') v = `"${v}"`; else if (t == 'object' && v !== null) v = self(v);
        json.push((arr ? '' : `"${n}":`) + String(v));
      }
    }
    return (arr ? '[' : '{') + String(json) + (arr ? ']' : '}');
  }
}

export function initParams(params) {
  // cna获取, userloginid获取, usermemberid获取
  if (document && document.cookie) {
    const cna = document.cookie.match(/\bcna=(.+?);/);
    if (cna && cna.length) {
      params.cna = cna[1];
    }

    let loginid = document.cookie.match(/__cn_login_id__=(.+?);/) ||
      document.cookie.match(/__cn_logon_id__=(.+?);/);
    if (loginid && loginid.length) {
      params.userinfo.userloginid = decodeURIComponent(loginid[1]);
    } else {
      loginid = document.cookie.match(/__last_loginid__=(.+?);/);
      if (loginid && loginid.length) {
        params.userinfo.userloginid = decodeURIComponent(loginid[1]);
      }
    }

    const memberId = document.cookie.match(/last_mid=(.+?);/);
    if (memberId && memberId.length) {
      params.userinfo.usermemberid = decodeURIComponent(memberId[1]);
    }
  }

  // userid 获取, userloginid 补充
  const aplusDom = document.getElementById('beacon-aplus') || document.getElementById('tb-beacon-aplus');
  let userId = document.cookie.match(/__last_userid__=(.+?);/);
  if ((userId && userId.length) || (aplusDom && aplusDom.getAttribute)) {
    const exparams = (aplusDom && aplusDom.getAttribute) ? (aplusDom.getAttribute('exparams') || '') : '';
    userId = exparams.match(/userid=([^&]*)/) || userId;
    if (userId && userId.length) {
      params.userinfo.userid = userId[1];
    }
  }

  if (!params.userinfo.userloginid && document.querySelector) {
    const accountDom = document.querySelector('#alibar .account-id a');
    if (accountDom && accountDom.getAttribute) {
      params.userinfo.userloginid = accountDom.getAttribute('title') || '';
    }
  }

  // spm来源和当前spm值获取
  const spm = /spm=(.*)/.exec(window.location.href);
  params.spmfrom = spm && spm.length ? spm[1].split('&')[0] : '';

  if (window.goldlog && window.goldlog.spm_ab) {
    params.spmcurrent = window.goldlog.spm_ab.join('.');
  } else if (document.querySelector) {
    try {
      params.spmcurrent = `${document.querySelector('meta[name=data-spm]').getAttribute('content')}.${document.querySelector('body').getAttribute('data-spm')}`;
    } catch (e) { }
  }

  return params;
}

function report(url) {
  const img = new Image();
  img.src = url;
}

function AliLogTracker(appName, type, customParams, host = 'cn-hangzhou.log.aliyuncs.com') {
  if (typeof appName !== 'string' || typeof type !== 'string') {
    return;
  }
  this._customParams = customParams;

  let project; let logstore;

  // 特殊的打点类型，全链路个性化打点、性能打点
  if (type.indexOf('full-biz/') !== -1) {
    project = 'full-biz';
    logstore = type.split('/')[1];
  } else if (type.indexOf('performance/') !== -1) {
    project = 'performance';
    logstore = type.split('/')[1];
  } else {
    const arr = appName.split('/');
    project = arr[0] || '';
    logstore = arr[1] || '';
  }

  if (!project || !logstore) {
    return;
  }
  this.uri_ = `//${project}.${host}/logstores/${logstore}/track_ua.gif?APIVersion=0.6.0`;
  if (this._customParams) {
    this.params_ = {};
  } else {
    this.params_ = {
      appname: appName,
      type,
      log: {},
      cna: '',
      userinfo: {
        userid: '',
        userloginid: '',
        usermemberid: '',
      },
      spmfrom: '',
      spmcurrent: '',
    };
    try {
      this.params_ = initParams(this.params_);
    } catch (e) { }
  }
  return this;
}

AliLogTracker.prototype = {
  log(key, value) {
    if (this._customParams) {
      if (!value && typeof key === 'object') {
        for (var k in key) {
          this.params_[k] = key[k];
        }
      } else if (key && value) {
        this.params_[key] = value;
      }
      return this;
    }
    if (!value && typeof key === 'object') {
      for (var k in key) {
        this.params_.log[k] = key[k];
      }
    } else if (key && value) {
      this.params_.log[key] = value;
    }
    return this;
  },
  report() {
    let url = this.uri_;
    if (this._customParams) {
      for (var k in this.params_) {
        var log = this.params_[k];
        if (typeof log === 'object') {
          log = stringify(log);
        }
        url += (`&${k}=${encodeURIComponent(log)}`);
      }
      report(url);
      this.params_ = {};
      return;
    }

    this.params_.time = new Date().getTime();
    for (var k in this.params_) {
      var log = this.params_[k];
      if (k === 'log' || k === 'userinfo') {
        log = stringify(log);
      }
      url += (`&${k}=${encodeURIComponent(log)}`);
    }
    report(url);
    this.params_.log = {};
  },
};
// 工具类挂载
AliLogTracker.utils = {
  stringify,
};
// 插件挂载
AliLogTracker.plugins = {};
// 配置挂载
if (!AliLogTracker.config) {
  AliLogTracker.config = {};
}

// 浏览器环境直接挂载到 window 下
if (window) {
  window.AliLogTracker = AliLogTracker;
}

const tracker = new AliLogTracker('cbu-national-platform/global_fe_logger', 'global_fe_logger');

export default (data) => {
  if (!data) {
    return;
  }

  const { hostname } = window.location;
  if (hostname.includes('-test') || hostname.includes('localhost')) {
    return;
  }
  if(typeof data === 'object'){
    const nonNullable = Object.keys(data).reduce((acc, key) => {
      if (data[key] != null) {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    tracker.log(nonNullable).report();
  }else{
    tracker.log(data).report();
  }

};
