
// const getTriangleSide = function (x1, y1, x2, y2) {
//   const x = Math.abs(x1 - x2);
//   const y = Math.abs(y1 - y2);
//   const z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

//   return { x, y, z };
// };
// const getAngle = function (triangle) {
//   const cos = triangle.y / triangle.z;
//   const radian = Math.acos(cos);

//   return 180 / (Math.PI / radian);
// };
// const ANGLE_THREHOLD = 35;

// /**
//  * a pull to refresh  compnent which is similar to material design
//  */
// class Refresh {
//   /**
//      * @param {Object} [config]
//      *      @param {String|HTMLElement} [config.scroller=body] - the scroll element
//      *      @param {Number} [config.threshold=88] - pull down how much distance to trigger refresh
//      *      @param {Number} [config.top=-40] - the loading indicator's default top
//      *      @param {Function} [config.onrefresh] - the callback to run when refresh fired
//      */
//   constructor(config) {
//     config = Object.assign({
//       scroller: 'body',
//       threshold: 88,
//     }, config);
//     const webkitPrefix = 'transform' in document.body.style ? '' : '-webkit-';
//     const scroller = typeof config.scroller === 'string' ? document.querySelector(config.scroller) : config.scroller;
//     // if start to pull
//     let isStartPull;
//     // if trigger to refresh in touchmove
//     let hasTriggerRefresh;
//     // if pull to refresh is paused
//     let isPausePull;

//     let preX = 0;
//     let preY = 0;
//     let deg = 0;
//     let translateY = 0;

//     const loadingEl = (function () {
//       const el = document.createElement('i');
//       el.className = 'h2-refresh';
//       if (config.top) {
//         el.style.top = `${config.top}px`;
//       }
//       scroller.insertBefore(el, scroller.firstElementChild);
//       return el;
//     }());

//     scroller.addEventListener('touchstart', (e) => {
//       if (isPausePull) {
//         return;
//       }
//       isStartPull = false;
//       preX = e.touches[0].pageX;
//       preY = e.touches[0].pageY;
//     }, {
//       passive: false,
//     });
//     scroller.addEventListener('touchmove', (e) => {
//       if (isPausePull || !preY) {
//         return;
//       }
//       const touch = e.touches[0];
//       const distence = touch.pageY - preY;
//       const scrollTop = scroller === document.body ? window.pageYOffset : scroller.scrollTop;

//       if (!isStartPull) {
//         const triangle = getTriangleSide(preX, preY, touch.pageX, touch.pageY);
//         if (distence > 0 && scrollTop === 0 && getAngle(triangle) < ANGLE_THREHOLD) {
//           isStartPull = true;
//         }
//       } else {
//         translateY = Math.round(distence / 2);
//         deg = Math.round(360 / config.threshold * translateY);
//         if (translateY > config.threshold) {
//           translateY = config.threshold;
//           hasTriggerRefresh = true;
//         } else {
//           hasTriggerRefresh = false;
//         }
//         loadingEl.style[`${webkitPrefix}transform`] = `translate3d(0,${translateY}px,0) rotate(${deg}deg)`;
//         loadingEl.style.opacity = '1';
//       }

//       if (isStartPull) {
//         e.preventDefault();
//       }
//     }, {
//       passive: false,
//     });
//     let style;
//     scroller.addEventListener('touchend', (e) => {
//       if (!isStartPull || isPausePull || !preY) {
//         return;
//       }
//       isStartPull = false;
//       isPausePull = true;
//       const resume = function () {
//         loadingEl.style[`${webkitPrefix}animation`] = '';
//         loadingEl.style[`${webkitPrefix}transition`] = `${webkitPrefix}transform .25s linear`;
//         loadingEl.style[`${webkitPrefix}transform`] = '';
//         setTimeout(() => {
//           loadingEl.style[`${webkitPrefix}transition`] = '';
//           loadingEl.style.opacity = '';
//           isPausePull = false;
//         }, 250);
//       };
//       if (hasTriggerRefresh) {
//         if (!style) {
//           const style = document.createElement('style');
//           style.innerHTML = `@${webkitPrefix}keyframes h2-refresh{100%{${webkitPrefix}transform: translate3d(0,${translateY}px,0) rotate(${deg + 360}deg)}}`;
//           document.head.appendChild(style);
//         }
//         loadingEl.style[`${webkitPrefix}animation`] = 'h2-refresh .8s linear infinite';

//         setTimeout(() => {
//           if (config.onrefresh) {
//             config.onrefresh();
//             resume();
//           } else {
//             location.reload();
//           }
//         }, 200);
//       } else {
//         resume();
//       }
//     }, {
//       passive: false,
//     });
//   }
// }
// export default Refresh;
