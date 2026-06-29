import React from 'react';
import ReactDOM from 'react-dom/client';
import LoginModal from '@/components/Login';
import { httpRequest } from '@/services/mtop';
import MiniLoginEmbedder from '@ali/mini-login-embedder';
import {
  serviceBaseUrl,
  appBaseUrl,
  appVersionType,
  AppVersionType,
  globalMemberAPIUrl,
} from '@/utils/env';
import { $t } from '@/i18n';
import request from '@/services/httpRequest';
import {
  getToken,
  getRefreshToken,
  removeRefreshToken,
  removeToken,
} from './bearerTokenHelper';
import { resetUserInfo, googleRecord } from '@/utils/log';
import { getCookie, setCookie, removeCookie } from '@/utils/cookie';
import { isMobile } from '@/utils/env';
import { UUID_KEY } from '@/utils/bearerTokenHelper';
import { postMessageToParent } from './postMessageToParent';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  hasAccessPermission?: boolean;
  loginId?: string;
  uniqueIdentify?: string;
}

// 全局状态
let authState = {
  user: null as User | null,
  isAuthenticated: false,
};

// 弹窗控制
let modalContainer: HTMLDivElement | undefined;
let modalRoot: ReactDOM.Root | undefined;
let modalResolve: ((user: User) => void) | null = null;
let modalReject: ((error: any) => void) | null = null;

type TypeGetUserInfoOptions = {
  refresh?: boolean;
};

export const embedderLogin = new MiniLoginEmbedder({
  appName: 'taobao',
});

export const checkThirdPartyCookie = (): Promise<[boolean, string]> => {
  return new Promise((resolve, reject) => {
    return embedderLogin
      .checkThirdPartyCookie()
      .then((res: any) => {
        if (res && res.banThirdPartyCookie === false) {
          resolve([true, '']);
        } else {
          resolve([false, '3cookie']);
        }
      })
      .catch((err: any) => {
        resolve([false, 'promise-catch']);
      });
  });
};

// 获取登录页面URL
export async function getLoginPageUrl(
  target?: string,
  topRedirectUrl?: boolean,
): Promise<string> {
  return new Promise((resolve, reject) => {
    httpRequest({
      url: `${serviceBaseUrl}/signIn?target=${encodeURIComponent(
        target || window.location.href,
      )}${topRedirectUrl ? '&fullRedirect=true' : ''}`,
      credentials: 'include',
      method: 'GET',
      data: {},
    })
      .then((data) => {
        if (data) {
          resolve(data);
        } else {
          resolve('');
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export const aTagToNewPage = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// 创建并显示登录弹窗
export async function showLoginModal(): Promise<void> {
  const [isThirdPartyCookie] = await checkThirdPartyCookie();
  if (!isThirdPartyCookie) {
    // if(issafri)
    location.replace(`${appBaseUrl}/login?target=${encodeURIComponent(window.location.href)}`);
    // aTagToNewPage(`${appBaseUrl}/login?target=${encodeURIComponent(window.location.href)`);
    return Promise.reject();
  }
  let loginUrl = '';
  if (appVersionType === AppVersionType.CN) {
    // 获取登录URL
    loginUrl = await getLoginPageUrl();

    if (!loginUrl) {
      return Promise.reject(
        new Error($t('global-1688-ai-app.login.hiFd', '获取登录URL失败')),
      );
    }
  } else {
  }

  return new Promise((resolve, reject) => {
    // 创建容器
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'login-modal-container';
      document.body.appendChild(modalContainer);
      modalRoot = ReactDOM.createRoot(modalContainer);
    }

    // 渲染登录弹窗
    modalRoot?.render(
      React.createElement(LoginModal, {
        visible: true,
        initialLoginUrl: loginUrl,
        onCancel: () => {
          hideLoginModal();
          reject(
            new Error(
              $t('global-1688-ai-app.login.userCancelLogin', '用户取消登录'),
            ),
          );
        },
        onSuccess: (event: any) => {
          handleLoginSuccess();
          resetUserInfo(event?.uniqueIdentify || getCookie('unb'));
          resolve();
        },
      }),
    );
  });
}

// 隐藏并销毁登录弹窗
export function hideLoginModal() {
  if (modalRoot) {
    modalRoot.unmount();
    modalRoot = undefined;
  }
  if (modalContainer && modalContainer.parentNode) {
    document.body.removeChild(modalContainer);
    modalContainer = undefined;
  }
  modalResolve = null;
  modalReject = null;
}

// 处理iframe的postMessage
async function handleLoginSuccess() {
  // 处理登录成功
  try {
    // 获取用户信息
    const user = await getUserInfo({ refresh: true });
    if (user) {
      authState.user = user;
      authState.isAuthenticated = true;
      googleRecord('login');
      modalResolve?.(user);
    } else {
      modalReject?.(
        new Error($t('global-1688-ai-app.login.hrrol', '获取用户信息失败')),
      );
    }
  } catch (error) {
    console.error('处理登录成功失败:', error);
    modalReject?.(error);
  } finally {
    hideLoginModal();
  }
}

export function getGlobalAuthLinkInfo() {
  return new Promise((resolve) => {
    httpRequest({
      url: `${globalMemberAPIUrl}/alphashop.user.info.detail/1.0/HSF`,
      method: 'POST',
      credentials: 'include',
      ...(appVersionType === AppVersionType.GLOBAL
        ? {
          body: JSON.stringify({
            data: {},
          }),
        }
        : { data: {} }),
      headers: {
        language: window.pageData?.language || 'zh_CN',
        region: 'alphashop',
        currency: 'usd',
      },
    })
      .then((res) => {
        resolve(res?.data?.data || {});
      });
  });
}

// 获取用户信息
export function getUserInfo(opt: TypeGetUserInfoOptions = {}): Promise<User | null> {
  const { refresh = false } = opt;
  const isGlobal = appVersionType === AppVersionType.GLOBAL;
  return new Promise((resolve) => {
    if (authState.isAuthenticated && !refresh) {
      resolve(authState.user);
      return;
    }
    httpRequest({
      url:
        isGlobal
          ? `${globalMemberAPIUrl}/alphashop.user.info/1.0/HSF `
          : `${serviceBaseUrl}/getUserInfo`,
      method: isGlobal ? 'POST' : 'GET',
      credentials: 'include',
      ...(isGlobal
        ? {
          body: JSON.stringify({
            data: {},
          }),
        }
        : { data: {} }),
      headers:
        isGlobal
          ? {
            language: window.pageData?.language || 'zh_CN',
            region: 'alphashop',
            currency: 'usd',
          }
          : {},
    })
      .then(async (data) => {
        const _data =
          isGlobal ? data?.data?.data : data;
        if (_data?.loginId || _data?.uniqueIdentify) {
          const user = {
            loginId: _data?.loginId || _data?.nick,
            userImg: _data?.userImg || _data?.avatar,
            ..._data,
          };

          postMessageToParent('alphashop.user.info', user);
          if (isGlobal) {
            try {
              const linkResult = await getGlobalAuthLinkInfo();
              user.linkInfo = linkResult || {};
            } catch { }
          }

          authState.user = user;
          authState.isAuthenticated = true;
          setCookie(UUID_KEY, _data?.uniqueIdentify);
          resolve(user);
        } else {
          postMessageToParent('alphashop.user.info', null);
          resolve(null);
        }
      })
      .catch(() => {
        authState.user = null;
        authState.isAuthenticated = false;
        resolve(null);
      });
  });
}

// 获取登录状态
export async function isAuthenticated(): Promise<boolean> {
  // 如果已有用户信息，直接返回状态
  if (authState.user) {
    return authState.isAuthenticated;
  }

  // 否则尝试获取用户信息
  const user = await getUserInfo({});
  return !!user;
}

// 同步获取登录状态
export function isAuthenticatedSync(): boolean {
  return authState.isAuthenticated && !!authState.user;
}

function globalLogout() {
  return request({
    url: `${globalMemberAPIUrl}/alphashop.user.logout/1.0/HSF`,
    headers: {
      language: window.pageData?.language || 'zh_CN',
      region: 'alphashop',
      currency: 'usd',
    },
    method: 'POST',
    body: JSON.stringify({
      data: {
        refreshToken: getRefreshToken(),
        token: getToken(),
      },
    }),
  });
}

// 登出
export function logout() {
  if (appVersionType === AppVersionType.GLOBAL) {
    globalLogout().then((result) => {
      if (result?.data) {
        removeRefreshToken();
        removeToken();
        removeCookie(UUID_KEY);
        window.location.replace(window.location.href);
      } else {
        console.error('登出失败:', result);
      }
    });
  } else {
    window.location.replace(
      `https://login.1688.com/member/signout.htm?done=${encodeURIComponent(
        `${serviceBaseUrl}/logout?target=${encodeURIComponent(
          window.location.href,
        )}`,
      )}`,
    );
  }
  resetUserInfo('');
}

// 检查登录状态并在需要时显示登录弹窗
export async function checkAuthAndLogin(options?: {
  onSuccess?: () => void;
  onFail?: (error: any) => void;
  type?: string;
}): Promise<boolean> {
  const _isMobile = options?.hasOwnProperty('type') ? options.type === 'mobile' : isMobile;
  if (!(await isAuthenticated())) {
    try {
      if (_isMobile) {
        const loginUrl = await getLoginPageUrl();
        if (loginUrl) {
          location.replace(loginUrl);
        }
        return false;
      }
      await showLoginModal();
      options?.onSuccess?.();
      return true;
    } catch (error) {
      console.error('登录失败或取消:', error);
      options?.onFail?.(error);
      return false;
    }
  }
  return true;
}
