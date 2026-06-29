import { CSS_VARIABLES } from '@/styles/css-variables';

// 将TypeScript颜色常量注入为CSS变量到:root选择器
export function injectAllCSSVars() {
  if (typeof document === 'undefined') return;

  // 检查是否已经注入过，避免重复
  if (document.getElementById('css-variables-style')) return;

  // 生成CSS变量样式
  const cssText = `:root {\n${Object.entries(CSS_VARIABLES)
    .map(([cssVar, value]) => `  ${cssVar}: ${value};`)
    .join('\n')}\n}`;

  // 创建style标签注入到head
  const style = document.createElement('style');
  style.id = 'css-variables-style';
  style.textContent = cssText;
  document.head.appendChild(style);
} 