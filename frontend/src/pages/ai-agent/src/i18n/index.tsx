import { $t, setGlobalDisabledI18nInChinaSite, setGlobalLang } from '@ali/1688-global-i18n-core';

export * from '@ali/1688-global-i18n-core';
export { default } from '@ali/1688-global-i18n-core';

window.$t = $t;

export const initI18n = () => {
  setGlobalDisabledI18nInChinaSite(false);
  setGlobalLang(window.pageData?.language || 'zh_CN');
};

