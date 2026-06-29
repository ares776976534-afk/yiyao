import React, { useEffect, useRef, useState, useCallback } from 'react';
import { formatTime } from '@/utlis';
import './index.scss';

export function CountDown({ endTime }) {
  const [count, setCount] = useState(0);
  const timeId = useRef(null);
  const now = Math.floor(Date.now() / 1000);
  const remainingTime = endTime - now;
  // 重新计算时间差，避免误差
  const updateTime = useCallback(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = endTime - currentTime;
    setCount(timeLeft >= 0 ? timeLeft : 0);
    if (timeLeft <= 0) {
      clearInterval(timeId.current);
    }
  }, [endTime]);
  useEffect(() => {
    if (endTime > 0) {
      updateTime();
      timeId.current = setInterval(updateTime, 1000);
      return () => {
        clearInterval(timeId.current);
      };
    }
  }, [endTime, updateTime]);
  const timeParts = formatTime(count);
  return count === 0 || remainingTime < 0 ? (
    <div style={{ color: '#FF7300' }}>已结束</div>
  ) : (
    <div className="bcproducts-card-rest-time">
      距结束
      <div className="time-container">
        <div className="time-box-days">{timeParts?.days}天</div>
        <div className="time-box-content">
          <div className="time-box">{timeParts?.hours}</div>
          <div className="colon">:</div>
          <div className="time-box">{timeParts?.minutes}</div>
          <div className="colon">:</div>
          <div className="time-box">{timeParts?.seconds}</div>
        </div>
      </div>
    </div>
  );
}
