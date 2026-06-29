import Mtop from '@/service/mtop';

export default {
  request({ data, ...opts }) {
    return Mtop.request({
      // 通用参数
      v: '1.0', // 必须
      ecode: 0, // 必须（注意2）
      type: 'GET', // 非必须。请求类型（GET/POST），默认是GET
      dataType: 'jsonp', // 非必须。数据类型（jsonp/originaljsonp/json），默认jsonp
      timeout: 20000, // 非必须。接口超时设置，默认为20000ms,
      data: JSON.stringify(data),
      ...opts,
    });
  },
};
