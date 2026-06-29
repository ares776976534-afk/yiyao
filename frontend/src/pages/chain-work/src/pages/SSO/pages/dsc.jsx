import React, { useEffect, useState } from 'react';
import { getSearchParams } from 'ice';
import { dscSSOTargetUrl } from '../service';
import { isPreEnv } from '@/utlis';
import TabBanner from '@/components/TabBanner';
import SecurityUtil from '@ali/ts-security-lib-fe';

const _isPreEnv = isPreEnv();
const HOST = _isPreEnv ? 'pre-web.scm.tmall.com' : 'web.scm.tmall.com';
const MERCHANT_CODE = _isPreEnv ? 'CSBABADCHAIN' : 'BABADCHAIN';
const MERCHANT_TYPE = _isPreEnv ? '100011' : '100011';

SecurityUtil.addSingleURLToWhitelist('tmall.com');

export default () => {
  const params = getSearchParams();
  const { url: targetUrl, _url: backUpUrl } = params;
  const [iframeUrl, setIframeUrl] = useState(null);

  const safeTargetUrl = SecurityUtil.getSafeURL(targetUrl);
  const safeBackUpUrl = SecurityUtil.getSafeURL(backUpUrl);

  const renderIframe = () => {
    switch (safeTargetUrl) {
      case 'https://web.cbbs.tmall.com/pages/babadchain/purchase_order_list_v4':
        return (
          <div className="h-full">
            <TabBanner />
            <iframe src={iframeUrl} sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation" style={{ width: '100%', height: 'calc(100% - 100px)', border: 0, marginTop: '12px' }} />
          </div>
        );
      default:
        return <iframe src={iframeUrl} style={{ width: '100%', height: '100%', border: 0 }} />;
    }
  };

  useEffect(() => {
    const target = `https://${HOST}/pages/ascm/basic_login_proxy?redirectURL=${safeTargetUrl || safeBackUpUrl}&merchantCode=${MERCHANT_CODE}&merchantType=${MERCHANT_TYPE}&layout=iframe&tenantCode=${MERCHANT_CODE}`;

    dscSSOTargetUrl(target)
      .then((res) => {
        const { trustLoginUrl = null } = res || {};
        let url = trustLoginUrl;
        if (!trustLoginUrl) {
          url = `https://${HOST}/login?from=${safeTargetUrl || safeBackUpUrl}`;
        }
        setIframeUrl(url);
      });
  }, []);

  return (
    <div style={{ height: '100vh', padding: '0 12px 0 0' }}>
      {
        iframeUrl ? renderIframe() : null
      }
    </div>
  );
};
