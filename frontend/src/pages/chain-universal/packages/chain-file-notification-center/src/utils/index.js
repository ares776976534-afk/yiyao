import Feed from './feedListener';
import { PARENT_TARGET, CHILDREN_TARGET, FILE_CENTER_START_POLL, FILE_CENTER_ON_SUCCESS, FILE_CENTER_ON_ERROR } from '../constants';
import service from '../service';

export const inAscpPortal = () => {
  if (window.top !== window && window.location.search.indexOf('__IFRAME_CONTAINER_IFRAME_ID__') > -1) {
    return true;
  }
  return false;
};


export const pushToNotificationCenter = (action, data = {}) => {
  try {
    if (inAscpPortal()) {
      window.top.postMessage({
        action: `${PARENT_TARGET}_${action}`,
        params: data,
      }, '*');
    } else {
      window.postMessage({
        action: `${PARENT_TARGET}_${action}`,
        params: data,
      }, '*');
    }
  } catch (error) {
    console.error(error);
  }
};


export const pushToSource = (action, data) => {
  try {
    if (inAscpPortal()) {
      window.postMessage({
        action: `${CHILDREN_TARGET}_${action}`,
        params: data,
      }, '*');
    } else {
      const iframes = document.getElementsByTagName('iframe');
      for (let i = 0; i < iframes.length; i++) {
        const targetWindow = iframes[i].contentWindow;
        targetWindow.postMessage({
          action: `${CHILDREN_TARGET}_${action}`,
          params: data,
        }, '*');
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const startPoll = (taskCode, taskId) => {
  pushToNotificationCenter(FILE_CENTER_START_POLL, {
    taskCode,
    taskId,
  });
};

export const fileTaskSuccess = (data) => {
  const { taskCode } = data;
  pushToSource(`${FILE_CENTER_ON_SUCCESS}_${taskCode}`, data);
};

export const fileTaskError = (data) => {
  const { taskCode } = data;
  pushToSource(`${FILE_CENTER_ON_ERROR}_${taskCode}`, data);
};
export const getUrlParam = (key) => {
  const value =
    new URLSearchParams(location.search).get(key)
  return value || '';
};
export const getExportUrl = code => decodeURIComponent(service.createExport.URL.href).replace('{code}', code);
export const getImportUrl = code => decodeURIComponent(service.createImport.URL.href).replace('{code}', code);
export const getImportTemplateUrl = code => decodeURIComponent(service.getImportTemplate.URL.href).replace('{code}', code);
export const getImportErrorFileUrl = taskId => decodeURIComponent(service.importErrorFile.URL.href).replace('{taskId}', taskId);
export const getImportErrorMsgUrl = taskId => decodeURIComponent(service.importErrorMsg.URL.href).replace('{taskId}', taskId);
export const exportFileUrl = taskId => decodeURIComponent(service.exportFile.URL.href).replace('{taskId}', taskId);

export const FeedListener = Feed;
// const exportModule = {
//   inAscpPortal,
//   FeedListener,
//   pushToNotificationCenter,
//   pushToSource,
//   startPoll,
//   fileTaskSuccess,
//   fileTaskError,
//   getExportUrl,
//   getImportUrl,
//   getImportTemplateUrl,
//   exportFileUrl,
//   getImportErrorFileUrl,
//   getImportErrorMsgUrl,
// };

// export default exportModule;
// module.exports = exportModule;
