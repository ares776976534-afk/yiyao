import locale from '../locale';
import moment from 'moment';
import React from 'react';

const PM = 'PM';
const AM = 'AM';
export function getDateDiff(dateTimeStamp) {
  if (typeof dateTimeStamp === 'string') {
    dateTimeStamp = new Date(dateTimeStamp).getTime();
  }
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = month * 12;
  let result = '';
  const now = new Date().getTime();
  const diffValue = now - dateTimeStamp;
  if (diffValue < 0) { return; }
  const yearC = diffValue / year;
  const monthC = diffValue / month;
  const weekC = diffValue / (7 * day);
  const dayC = diffValue / day;
  const hourC = diffValue / hour;
  const minC = diffValue / minute;
  if (yearC >= 1) {
    result = `${parseInt(yearC)}${locale.yearsAgo}`;
  } else if (monthC >= 1) {
    result = `${parseInt(monthC)}${locale.monthAgo}`;
  } else if (weekC >= 1) {
    result = `${parseInt(weekC)}${locale.weeksAgo}`;
  } else if (dayC >= 1) {
    result = `${parseInt(dayC)}${locale.daysAgo}`;
  } else if (hourC >= 1) {
    result = `${parseInt(hourC)}${locale.hoursAgo}`;
  } else if (minC >= 1) {
    result = `${parseInt(minC)}${locale.minsAgo}`;
  } else result = locale.just;
  return result;
}

export const convertHour = ({ishour12, originalDateTime}) => ({dateTime, relative}) =>{
  // 使用相对时间时不添加时间单位
  if (relative) {
    return dateTime;
  }
  if (ishour12) {
    // 获得原始时间的小时
    const $h = moment(originalDateTime).hours();
    // 12 <= $h < 24 代表是上午，否则是下午
    const dom = (unit) => (
      <div>
        <span>{dateTime}</span>
        <span className="unit">{unit}</span>
      </div>
    );
    if ($h >= 12 && $h < 24) {
      return dom(PM);
    } else {
      return dom(AM);
    }
  }
  return dateTime;
};

export const convertFormat = ({ishour12, originFormat = ''}) => {
  if (ishour12) {
    return originFormat.replace(/H/g, 'h');
  } else {
    return originFormat.replace(/h/g, 'H');
  }
};