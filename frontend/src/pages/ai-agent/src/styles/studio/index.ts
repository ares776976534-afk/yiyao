import { antdTokenConfig as lightAntdTokenConfig, cssVariables as lightColors } from "./light";
import { antdTokenConfig as darkAntdTokenConfig, cssVariables as darkColors } from "./dark";

export const antdProviderValue = (theme: 'light' | 'dark' = 'light') => {
  if (theme === 'light') {
    return lightAntdTokenConfig;
  }

  return darkAntdTokenConfig;
};

// 向页面注入css变量
export const injectCSSVars = (theme: 'light' | 'dark' = 'light') => {
  const id = `studion-css-variables`;
  const colors = theme === 'light' ? lightColors : darkColors;
  let styleDOM = document?.getElementById?.(id);

  if (!styleDOM) {
    styleDOM = document.createElement('style');
    styleDOM.id = id;
    document.body.appendChild(styleDOM);
  }

  document.documentElement.setAttribute('data-theme', theme);

  const dataTheme = styleDOM?.getAttribute('data-theme');
  // 避免重复注入
  if (dataTheme === theme) return;

  styleDOM.setAttribute('data-theme', theme);

  // 生成CSS变量样式
  const cssText = `:root {\n${Object.entries(colors)
    .map(([cssVar, value]) => `--${cssVar}: ${value};`)
    .join('\n')}\n}`;

  styleDOM.textContent = cssText;
}

export const antdToken = darkAntdTokenConfig;
