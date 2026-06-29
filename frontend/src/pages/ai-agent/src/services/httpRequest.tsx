import { message } from 'antd';
import { checkAuthAndLogin, getUserInfo } from '@/utils/login';
import { materialBaseAPIUrl, isGlobal } from '@/utils/env';
import { $t } from '@/i18n';
import { DEFAULT_LANG } from '@/i18n/constants';
import { getToken } from '@/utils/bearerTokenHelper';

/**
 * 从响应头中提取文件名
 * @param response - fetch 响应对象
 * @returns 文件名
 */
function getFileNameFromResponse(response: Response): string {
  const contentDisposition = response.headers.get('content-disposition');

  return contentDisposition?.split('filename=')[1] || '';
}
interface HttpRequestOptions {
  needLogin?: boolean;
  continueAfterLogin?: boolean; // 未登录弹出登录框，登录完成后重新完成请求
  silent?: boolean; // 是否静默处理
  bearerToken?: boolean;
}

const defaults = {
  contentType: 'application/json',
};

// 根据响应头格式转换数据
const parseResponseData = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else if (
      contentType.includes('application/xml') ||
      contentType.includes('text/xml')
    ) {
      const text = await response.text();
      return new DOMParser().parseFromString(text, 'text/xml');
    } else if (contentType.includes('multipart/form-data')) {
      return await response.formData();
    } else if (
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/pdf')
    ) {
      const fileName = getFileNameFromResponse(response);
      const blob = await response.blob();
      (blob as any).fileName = fileName;

      return blob;
    } else {
      // 默认尝试解析为文本
      return await response.text();
    }
  } catch (error) {
    throw error;
  }
};

export default async function request(
  _url: any,
  _params?: any,
  _options?: HttpRequestOptions,
): Promise<any> {
  let url = _url;
  let params = _params || {};
  let options = _options || {};

  if (typeof _url === 'object') {
    params = _url;
    options = _params;
    url = params.url;
  }
  const bearerToken = options?.bearerToken ?? isGlobal;

  const { headers = {} } = params;
  let contentType = headers['Content-Type'];
  const contentType2 = headers['content-type'];

  if (contentType2) {
    delete headers['content-type'];
    contentType = contentType || contentType2;
    headers['Content-Type'] = contentType;
  }

  /** multipart/form-data的请求，不手动设置Content-Type
   * 没有设置Content-Type，并且数据类型不是FormData（FormData类型不设置Content-Type），设置默认值
   */
  if (contentType === 'multipart/form-data') {
    delete headers['Content-Type'];
  } else if (!contentType && !(params?.body instanceof FormData)) {
    headers['Content-Type'] = defaults.contentType;
  }

  const { continueAfterLogin = true, silent = false } = options || {};

  if (bearerToken) {
    params.headers = Object.assign({
      Authorization: `Bearer ${getToken()}`,
    }, params.headers || {}, headers);
  }

  params.headers = Object.assign(
    {
      'X-I18n-Language': DEFAULT_LANG,
    },
    params.headers || {},
    headers,
  );
  params.credentials = 'include';

  return await fetch(url, params)
    .then((res) => {
      if (res.status === 401) {
        if (silent) {
          return Promise.reject({ code: 'HTTP_401' });
        }
        return res.json().then((data) => {
          if (data?.code === 'FAIL_SYS_SESSION_EXPIRED') {
            // 未登录
            if (continueAfterLogin) {
              return new Promise((resolve, reject) => {
                checkAuthAndLogin()
                  .then((loginSuccess) => {
                    if (loginSuccess) {
                      getUserInfo()
                        .then((userInfo) => {
                          dispatchEvent(
                            new CustomEvent('setLoginData', {
                              detail: userInfo,
                            }),
                          );

                          if (
                            !userInfo ||
                            String(userInfo.hasAccessPermission) !== 'true'
                          ) {
                            // 无权限
                            message.info(
                              $t(
                                'global-1688-ai-app.services.httpRequest.nwm',
                                '您的账号暂未加入试用名单',
                              ),
                            );
                            return reject(data);
                          }
                          resolve(
                            request(url, params, {
                              ...options,
                              continueAfterLogin: false,
                            }),
                          );
                        })
                        .catch(() => {
                          reject(data);
                        });
                    } else {
                      reject(data);
                    }
                  })
                  .catch(() => {
                    reject(data);
                  });
              });
            }
            return Promise.reject(data);
          } else if (data?.code === 'NO_ACCESS_PERMISSION') {
            // 无权限
            message.info(
              $t(
                'global-1688-ai-app.services.httpRequest.nwm',
                '您的账号暂未加入试用名单',
              ),
            );
            return Promise.reject(data);
          }
        });
      }

      return parseResponseData(res);
    })
    .catch((error) => {
      // 拦截网络层错误（如 Failed to fetch、网络断开等）
      const isNetworkError =
        error instanceof TypeError &&
        (error.message === 'Failed to fetch' ||
          error.message.includes('network'));

      if (isNetworkError) {
        // 返回带标记的错误，调用方可以通过 _networkError 判断是否为网络错误
        return Promise.reject(
          Object.assign(error, {
            _networkError: true,
            message: $t(
              'global-1688-ai-app.LayerOfferElement.wlqqerror',
              '网络请求错误',
            ),
          }),
        );
      }

      // 非网络错误，继续往上抛
      return Promise.reject(error);
    });
}

// 不同的agent页面底层接口在不同的应用上，素材agent调用接口的域名使用create.alphashop.cn
export const materiaRequest = (
  url: string,
  params?: any,
  options?: HttpRequestOptions,
) => {
  return request(`${materialBaseAPIUrl}${url}`, params, options);
};
