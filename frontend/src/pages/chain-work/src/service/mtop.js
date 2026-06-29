import Mtop from '@ali/universal-mtop';
import { Logger } from '@/utlis';

export default {
  request({ data, ...opts }) {
    if (/wapa=1/.test(location.href) || location.host === 'pre-air.1688.com') {
      Mtop.config('subDomain', 'wapa');
    } else {
      Mtop.config('subDomain', 'm');
    }
    Mtop.config('prefix', 'h5api');
    Mtop.config('mainDomain', '1688.com');
    return Mtop.request({
      // 通用参数
      v: '1.0', // 必须
      ecode: 0, // 必须（注意2）
      type: 'GET', // 非必须。请求类型（GET/POST），默认是GET
      dataType: 'jsonp', // 非必须。数据类型（jsonp/originaljsonp/json），默认jsonp
      timeout: 20000, // 非必须。接口超时设置，默认为20000ms,
      data: JSON.stringify(data),
      ...opts,
    })
      .catch((err) => {
        Logger.saveRecord(err);
        return err;
      });
  },
};
