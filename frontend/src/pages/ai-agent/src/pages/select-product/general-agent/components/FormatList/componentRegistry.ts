import React from 'react';
import type { TypeComponentRegistry } from './MarkdownCustomComponents/types';
import { defaultComponents } from './MarkdownCustomComponents';

// 默认注册的组件（从 MarkdownCustomComponents 自动加载）
const defaultRegistry: TypeComponentRegistry = { ...defaultComponents };

// 全局组件注册表
let componentRegistry: TypeComponentRegistry = { ...defaultRegistry };

/**
 * 注册自定义标签组件
 * @param tagName - 标签名（如 'custom_button', 'qwen:takeaway'）
 * @param component - React 组件
 */
export const registerComponent = (tagName: string, component: React.ComponentType<any>): void => {
  componentRegistry[tagName] = component;
};

/**
 * 批量注册组件
 * @param components - 组件映射对象
 */
export const registerComponents = (components: TypeComponentRegistry): void => {
  componentRegistry = {
    ...componentRegistry,
    ...components,
  };
};

/**
 * 获取当前组件注册表
 */
export const getComponentRegistry = (): TypeComponentRegistry => {
  return { ...componentRegistry };
};

/**
 * 重置为默认组件注册表
 */
export const resetRegistry = (): void => {
  componentRegistry = { ...defaultRegistry };
};

/**
 * 移除指定标签的组件映射
 * @param tagName - 标签名
 */
export const unregisterComponent = (tagName: string): void => {
  delete componentRegistry[tagName];
};
