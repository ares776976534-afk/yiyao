import { useState, useEffect } from "react";
import { ConfigProvider, App } from "antd";
import { observer } from "mobx-react-lite";
import { StoreProvider } from "@/stores/context";
import { storeServices } from "@/services/studio/storeServices";
import { setGlobalLang } from "@/i18n";
import { injectCSSVars, antdProviderValue } from "@/styles/studio";
import { getUrlSearchParams, replaceUrlSearchParams } from "@/utils/url";
import { $t } from '@/i18n';
import { useStore } from "@/stores/context";
import { DEFAULT_LANG, LANG_MAPPING } from "@/i18n/constants";
import { event_setCssTheme, event_setLanguage } from "./event";
import useToast from "@/components/Toast";

export const Root = observer(
  (props: { theme?: string; language?: string; children: React.ReactNode }) => {
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const store = useStore();
    const urlParams = getUrlSearchParams();
    const customTheme = props.theme || urlParams.theme;
    const theme = customTheme || (store.userPrefer.theme as any);
    const toast = useToast();

    // 注入所有CSS变量
    useEffect(() => {
      const handleSetCssTheme = (e: CustomEvent<"light" | "dark">) => {
        injectCSSVars(e.detail);
      };
      const handleSetLanguage = (e: CustomEvent<string>) => {
        // 切换语言入库需要延迟一会等数据入库，然后刷新页面
        toast.loading($t('global-1688-ai-app.page.prepareReload', '即将刷新页面...'));
        setTimeout(() => {
          location.reload();
        }, 500);
      };

      injectCSSVars(theme);

      if (urlParams.theme) {
        replaceUrlSearchParams({ theme: "" });
        store.userPrefer.updateTheme(customTheme as "light" | "dark", true);
      }

      window.addEventListener(event_setCssTheme, handleSetCssTheme);
      window.addEventListener(event_setLanguage, handleSetLanguage);

      setIsInitialized(true);

      return () => {
        window.removeEventListener(event_setCssTheme, handleSetCssTheme);
        window.removeEventListener(event_setLanguage, handleSetLanguage);
      };
    }, []);

    if (!isInitialized) {
      return null;
    }

    return (
      <ConfigProvider
        prefixCls="studio"
        wave={{ disabled: true }}
        {...antdProviderValue(theme)}
      >
        {/* ConfigProvider下需要嵌套一个APP，否则一些弹窗样式不正常 */}
        <App>
          {props?.children}
        </App>
      </ConfigProvider>
    );
  }
);

export default (
  props = {} as {
    theme?: "light" | "dark";
    language?: string;
    children: React.ReactNode;
    root?: any;
    className?: string;
    style?: React.CSSProperties;
  }
) => {
  if (props.root) {
    document.documentElement.setAttribute("data-root", "studio");
  }

  return (
    <div data-root="studio" className={props.className} style={props.style}>
      <StoreProvider services={storeServices}>
        <App>
          <Root theme={props.theme} language={props.language}>
            {props.children}
          </Root>
        </App>
      </StoreProvider>
    </div>
  );
};
