import { useEffect, useState } from 'react';
import moment from 'moment';

export default ({ endTime, children, countDownEnd, startTime = new Date().valueOf() }) => {
  const [time, setTime] = useState({ day: '00', hour: '00', min: '00', second: '00' });
  let timer = null;
  let now = moment(startTime).valueOf();
  // 计算倒计时
  const countdown = () => {
    let diffTime = moment(endTime).valueOf() - now;
    diffTime /= 1000;

    if (diffTime < 0) {
      // 倒计时结束调用回调函数
      if (countDownEnd) countDownEnd();
      clearInterval(timer);
      return;
    }

    const d = Math.floor(diffTime / (24 * 3600));
    const h = Math.floor((diffTime / 3600) % 24);
    const m = Math.floor((diffTime / 60) % 60);
    const s = Math.floor(diffTime % 60);
    setTime({
      day: d,
      hour: h < 10 ? `0${h}` : h,
      min: m < 10 ? `0${m}` : m,
      second: s < 10 ? `0${s}` : s,
    });
  };

  useEffect(() => {
    countdown();
    timer = setInterval(() => {
      countdown();
      now += 1000;
    }, 1000);
    return () => clearInterval(timer); // 清理函数
  }, []);

  if (typeof children !== 'function') {
    throw new Error('children must be a function');
  }

  return children(time);
};
