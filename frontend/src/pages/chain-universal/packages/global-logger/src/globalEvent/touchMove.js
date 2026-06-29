import Logger from "../index";

const TOUCH_MOVE_INIT = 'touchMoveInit';

const MOVE_TIME = 500;

let startTime = ''; // 触摸开始时间
let startDistanceX = ''; // 触摸开始X轴位置
let startDistanceY = ''; // 触摸开始Y轴位置
let endTime = ''; // 触摸结束时间
let endDistanceX = ''; // 触摸结束X轴位置
let endDistanceY = ''; // 触摸结束Y轴位置
let moveTime = ''; // 触摸时间
let moveDistanceX = ''; // 触摸移动X轴距离
let moveDistanceY = ''; // 触摸移动Y轴距离

function eventTouchstart(e) {
  startTime = new Date().getTime();
  startDistanceX = e.touches[0].screenX;
  startDistanceY = e.touches[0].screenY;
}

function eventTouchend(e) {
  let direction = '';
  endTime = new Date().getTime();
  endDistanceX = e.changedTouches[0].screenX;
  endDistanceY = e.changedTouches[0].screenY;
  moveTime = endTime - startTime;
  moveDistanceX = startDistanceX - endDistanceX;
  moveDistanceY = startDistanceY - endDistanceY;
  // 判断滑动距离超过40 且 时间小于500毫秒
  if (
    (Math.abs(moveDistanceX) > 40 || Math.abs(moveDistanceY) > 40) &&
    moveTime < MOVE_TIME
  ) {
    // 判断X轴移动的距离是否大于Y轴移动的距离
    if (Math.abs(moveDistanceX) > Math.abs(moveDistanceY)) {
      // 左右
      direction = moveDistanceX > 0 ? 'left' : 'right';
    } else {
      // 上下
      direction = moveDistanceY > 0 ? 'up' : 'down';
    }

    if (direction) {
      Logger.report({
        actionType: `move_${direction}`,
      });
    }
  }
}

export default () => {
  // if (Logger.getConfig(TOUCH_MOVE_INIT)) return;

  document.removeEventListener('touchstart', eventTouchstart);
  document.removeEventListener('touchend', eventTouchend);
  document.addEventListener('touchstart', eventTouchstart);
  document.addEventListener('touchend', eventTouchend);

  // Logger.setConfig(TOUCH_MOVE_INIT, true);
};
