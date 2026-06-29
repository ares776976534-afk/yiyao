import * as React from 'react';
import { ASCPIframeContainer } from '@ali/chc-adaptor-iframe';
import { getSearchParams } from 'ice';
import { csbcLoginJudgement, csbcSSOTargetUrl } from '../service';

const ErrorTips = ({ type = 'systemError' }) => {
  const errorType = {
    noAuth: {
      iconUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01ZJkwED1Tz47kTTmD2_!!6000000002452-2-tps-720-648.png',
      tip: '暂无入仓商品，无需操作',
    },
    systemError: {
      iconUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01USce6F1DKjOKuxIql_!!6000000000198-2-tps-720-648.png',
      tip: '系统繁忙，请稍后再试',
    },
  };

  const options = errorType[type] || {};
  const { iconUrl, tip } = options;

  return (
    <div className="flex flex-row items-center justify-center h-[100%]">
      <div className="flex flex-col items-center justify-center">
        <div className="w-[10px] h-[126px]">
          <img src={iconUrl} style={{ width: '140px', height: '126px' }} />
        </div>
        <div className="text-[18px] text-[#333] h-[29px] flex flex-row items-center justify-center">{tip}</div>
      </div>
    </div>
  );
};


export default () => {
  const params = getSearchParams();
  const { url, _url: backUpUrl } = params;
  const [src, setSrc] = React.useState('about:blank');
  const [error, setError] = React.useState(null);
  const realUrl = url || backUpUrl;

  const ctxRef = React.useRef(null);

  const handleInit = React.useCallback((ctx) => {
    ctxRef.current = ctx;
  }, []);

  React.useEffect(() => {
    // xxxFetch
    // 免登，
    // 直接设置连接等。
    // 平台链接转 ascp 链接，或者转ascp 免登链接
    csbcLoginJudgement()
      .then((isLogin) => {
        let _url = decodeURIComponent(realUrl);
        if (!isLogin) {
          csbcSSOTargetUrl(realUrl)
            .then((res) => {
              _url = res;
              if (!_url) {
                setError('noAuth');
              } else {
                setSrc(_url);
              }
            });
        } else {
          setError('noAuth');
        }
      });
  }, []);
  const handleEvent = React.useCallback((e) => {
    // console.log('跳转e', e, `/biz-rest/ascp/${e?.url?.code}${e?.url?.urlObj?.search}`);
    switch (e.type) {
      case 'open':
      case 'reloadOpener':
      case 'backToOpener':
      case 'backToAndReloadOpener':
      case 'replaceSelf': {
        // console.log(e)
        const { code, project, urlObj } = e.url || {};
        // 看平台如何处理链接
        // const url = e?.url
        // TODO  绝大部分场景 基于三个地址，进行平台的跳转
        navigator.go();
        break;
      }
      case 'openSingleton': {
        const { urlObj = {} } = e.url || {};
        const { href } = urlObj;
        const tagetUrl = `https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/xiangqingye&__hex__url=${encodeURIComponent(href)}`;
        window.open(tagetUrl, '_blank');
        break;
      }
      case 'reload': {
        window.location.reload();
        break;
      }
      case 'close': {
        window.history.back();
        break;
      }
      case 'setTitle': {
        const { urlObj } = e.sourceUrl || {};
        if (urlObj && /^\/login/i.test(urlObj.pathname)) {
          window.location.reload();
        }
        break;
      }
      default:
    }
  }, []);

  return (
    <div style={{ height: '100vh' }} className="ascp-iframe-wrapper">
      {
        error ? <ErrorTips type={error} /> : <ASCPIframeContainer
          id="ascp-iframe-container"
          height="99%"
          width="100%"
          onInit={handleInit}
          src={src}
          onEvent={handleEvent}
          fetchpriority="high"
        />
      }
    </div>
  );
};
