// 窗口激活状态监测方法
export function monitorWindowStatus(onVisibilityChangeCallback) {
  const getHiddenProperty = () => {
    if ('hidden' in document) {
      return 'hidden';
    } else if ('webkitHidden' in document) {
      return 'webkitHidden';
    } else if ('mozHidden' in document) {
      return 'mozHidden';
    } else {
      return null;
    }
  };
  // 不同浏览器 hidden 名称
  const hiddenProperty = getHiddenProperty();
  // 不同浏览器的事件名
  const visibilityChangeEvent = hiddenProperty ? hiddenProperty.replace(/hidden/i, 'visibilitychange') : null;

  if (visibilityChangeEvent) {
    const onVisibilityChange = function () {
      if (!document[hiddenProperty]) {
        onVisibilityChangeCallback('visible'); // 页面可见时的回调
      } else {
        onVisibilityChangeCallback('hidden'); // 页面隐藏时的回调
      }
    };
    document.addEventListener(visibilityChangeEvent, onVisibilityChange);
    // 返回一个函数用于在组件卸载时移除事件监听器
    return () => document.removeEventListener(visibilityChangeEvent, onVisibilityChange);
  }
}

export function formatOrReturn(str) {
  const num = Number(str);

  if (!isNaN(num)) {
    if (Number.isInteger(num)) {
      return num.toLocaleString();
    } else {
      const formattedNum = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return formattedNum;
    }
  } else {
    return str;
  }
}

export function listData(list, labelName, valueName) {
  const NewList = list.map((item) => {
    return {
      ...item,
      value: item[valueName],
      label: item[labelName],
    };
  });
  return NewList;
}

export function formatNumberRange(arr) {
  if (arr) {
    if (arr.length === 1) {
      return arr;
    }
    if (arr.length < 1) {
      return '-';
    }
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const allIntegers = arr.every(Number.isInteger);
    const formattedMin = allIntegers ? min : formatOrReturn(min);
    const formattedMax = allIntegers ? max : formatOrReturn(max);
    return `${formattedMin}～${formattedMax}`;
  } else {
    return '-';
  }
}

export function colSpan(type) {
  if (type === 'length') {
    return 3;
  } if (type === 'width' || type === 'height') {
    return 0;
  }
}
