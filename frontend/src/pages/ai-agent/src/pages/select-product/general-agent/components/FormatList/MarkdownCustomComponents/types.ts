import type { ComponentType } from 'react';

// 组件 Props 接口
export interface TypeCustomComponentProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

// 组件渲染方式：inline（内联，如 <a>/<span>）或 block（块级，如 <div>）
export type TypeRenderAs = 'inline' | 'block';

// 组件配置元数据
export interface TypeComponentConfig {
  component: ComponentType<TypeCustomComponentProps>;
  renderAs?: TypeRenderAs; // 默认为 'block'
  tagName?: string; // 转换后的 HTML 标签名，默认为 'div'（block）或 'span'（inline）
  className?: string; // 自定义的 class 名称
}

// 组件注册表类型（支持直接组件或配置对象）
export interface TypeComponentRegistry {
  [tagName: string]: ComponentType<TypeCustomComponentProps> | TypeComponentConfig;
}

// Qwen Takeaway 组件 Props
export interface TypeQwenTakeawayProps extends TypeCustomComponentProps {
  className?: string;
}

// Qwen Cite 组件 Props
export interface TypeQwenCiteProps extends TypeCustomComponentProps {
  url?: string;
  className?: string;
}

