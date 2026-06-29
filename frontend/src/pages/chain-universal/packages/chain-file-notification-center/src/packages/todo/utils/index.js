/**
 * 函数节流：持续调用函数，只运行最后一次
 * @param {*} fn
 * @param {*} delay
 */
export function throttle(fn, delay = 1000) {
  let timer = null;
  return function () {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      // eslint-disable-next-line prefer-rest-params
      fn.apply(context, arguments);
    }, delay);
  };
}

export const encodeURL = function (obj) {
  let url = '';
  Object.keys(obj).forEach((key) => {
    const value = obj[key] == null ? '' : obj[key]; // default value as empty string
    url += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
  });
  return url;
};

export const getParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};


const taskCenterUrl = '//portalpro.hemaos.com/pages/taskCenter.html';


// 格式化任务链接
export function parseTaskLink(task) {
  const {
    jobType,
    pageJumpType,
    pageJumpValue,
    jobHandleType,
    jobId,
    ticketType,
    suiteId,
    creator,
    url,
  } = task;
  let link;
  let type;
  if (pageJumpType) {
    switch (pageJumpType) {
      case 'template':
        if (jobHandleType === 1) {
          type = 'approval';
        } else if (jobHandleType === 2) {
          type = 'work';
        }
        link = `${taskCenterUrl}?${encodeURL({
          pageType: 'list',
          businessType: 'standardList',
          type,
          jobType,
          jobId,
          ticketType,
          suiteId,
        })}`;
        break;
      case 'url':
        link = pageJumpValue;
        break;
      case 'suiteId':
        link = `${taskCenterUrl}?${encodeURL({
          pageType: 'list',
          businessType: setPage(pageJumpValue),
          jobType,
          jobId,
          ticketType,
          suiteId,
          creator,
        })}`;
        break;
      case 'none':
      case 'smartForm':
      default:
        break;
    }
  } else if (url) {
    link = url;
  } else {
    link = `${taskCenterUrl}?${encodeURL({
      pageType: 'list',
      businessType: setPage(suiteId),
      jobType,
      jobId,
      ticketType,
      suiteId,
      creator,
    })}`;
  }

  return link;
}

function setPage(suiteId) {
  const allPages = [
    'addItemCheck',
    'adjustPriceItemCheck',
    'newItemCheck',
    'updateItemCheck',
    'rightApplication',
    'orderReplenishList',
    'orderDistributeList',
    'rackExhibit',
    'replenishExhibit',
    'rackExhibitV2',
    'replenishExhibitV2',
  ];

  if (suiteId.startsWith('autoSetupFlow')) {
    return 'autoSetup';
  }

  return allPages.indexOf(suiteId) > -1 ? suiteId : 'emptyPage';
}


// const exportModules = {
//   // parseTaskLink,
//   encodeURL,
//   throttle,
//   getParam,
// };

// export default exportModules;
