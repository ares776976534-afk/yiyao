import React from 'react';
import { Message } from '@alifd/next';
import * as ajax from '@/service/ajax';
import { isPreEnv } from '@/utlis';
import { getAlipayRobotSwitch } from '@/service/common';

const _isPre = isPreEnv();
const HOST = _isPre ? '//pre-crossborder.1688.com' : '//crossborder.1688.com';

const getUserId = () => {
  return new Promise((resolve, rejcet) => {
    ajax.request(`${HOST}/alipay/getRequestToken`, (res) => resolve(res), {}, 'get', 'json', 30, (err) => rejcet(err));
  });
};

const listenIconClick = (e) => {
  e.stopPropagation();
  madaOnClose();
};

export const madaOnClose = () => {
  window.aiRobot.hideMadaIcon();
  document.getElementById('mada-sdk').removeEventListener('click', listenIconClick, false);
};

export const madaOpen = async (opt = {}) => {
  const token = await getUserId().then(({ model }) => model);
  window.aiRobot.initMada();
  let resultSuccess = false;
  try {
    const openResult = await window.aiRobot.openMada({
      options: {
        ...opt,
        headers: {
          '1688_logon_id': token,
        },
      },
    });
    const { success } = openResult;
    resultSuccess = success;
  } catch (e) {
    console.log(e);
  }

  if (!resultSuccess) {
    Message.error('客服资源繁忙，请稍后再试');
    return;
  }

  document.getElementById('mada-sdk').addEventListener('click', listenIconClick, false);
};

export const aiRobotSwitch = () => {
  return getAlipayRobotSwitch().then((res) => {
    return res;
  });
};

const init = () => {
  if (!(window?.IcsMadaSdk?.default || window.IcsMadaSdk)) {
    setTimeout(() => {
      init();
    }, 300);
  } else {
    try {
      if (!window.aiRobot) {
        const icsMadaSdk = window.IcsMadaSdk.default || window.IcsMadaSdk;
        // eslint-disable-next-line new-cap
        window.aiRobot = new icsMadaSdk({
          initModel: 'dynamic',
          dynamicDecisionParams: {
            sourcePageName: document.title,
            region: 'CN',
            country: 'CN',
            businessLine: 'CBU',
            language: 'zh_CN',
            env: _isPre ? 'PRE' : 'PROD', // 线上变更PROD
            siteName: 'CBU',
            bizType: 'CBU',
            terminalType: 'PC',
            sourcePageUrl: window.location.href,
            pathname: window.location.pathname,
          },
          appearance: {
            right: '68px',
          },
          normalIconUrl: '//gw.alicdn.com/imgextra/i4/O1CN01rLDnMs1NTZFpw9YmS_!!6000000001571-2-tps-32-32.png',
          closeIconUrl: '//img.alicdn.com/imgextra/i4/O1CN01SBkPca1zftJQ3s6xk_!!6000000006742-2-tps-168-168.png',
          isInitHideIcon: true,
          preLoadUrl: _isPre ? '//pre.ac.alipay.com/page/icsmada-global/home' : '//ac.alipay.com/page/icsmada-global/home',
          // 获取错误信息
          onError: (err) => console.log(err),
          siteName: 'CBU',
          bizType: 'CBU',
        });
        window.addEventListener('message', (e) => {
          const { origin = '', data = {} } = e;
          const { text } = data;
          if (origin.indexOf('ics-global') > -1) {
            switch (text) {
              case 'close':
                madaOnClose();
                break;
              default:
                break;
            }
          }
        });
      }
    } catch (e) {
      console.log('小码答报错', e);
    }
  }
};

init();

export default () => {
  return {
    ...window.aiRobot,
    madaOpen,
  };
};

// window.aiRobot = new icsMadaSdk({
//   initModel: 'dynamic',
//   dynamicDecisionParams: {
// sourcePageName: document.title,
// region: 'CN',
// country: 'CN',
// businessLine: '1688',
// language: 'zh_CN',
// env: 'PROD', // 线上变更PROD
// siteName: '1688_PORTAL',
// bizType: '1688',
//   },
//   isInitHideIcon: true,
//   // 获取错误信息
//   onError: (err) => console.log(err),
//   pageUrl: '//ics-global.alipay.com/mada/home',
//   siteName: '1688_PORTAL',
//   bizType: '1688',
// });
