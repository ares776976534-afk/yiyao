export const login = ({ success }: { success: () => void }) => {
  try {
    if (window.SysLogist) {
      window.SysLogist.init({
        source: 'aiAgent_Login',
        onLoginSuccess: () => {
          window.dispatchEvent(
            new CustomEvent('loginSuccess', { detail: { isLogin: true } }),
          );
          typeof success === 'function' && success();
        },
        onRegistSuccess: () => { },
      });
    } else {
      location.href = `https://login.1688.com/member/signin.htm?Done=${window.encodeURIComponent(
        location.href,
      )}`;
    }
  } catch (e) {
    location.href = `https://login.1688.com/member/signin.htm?Done=${window.encodeURIComponent(
      location.href,
    )}`;
  }
};

// 构建 URL 查询字符串
export const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, String(params[key]));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};
