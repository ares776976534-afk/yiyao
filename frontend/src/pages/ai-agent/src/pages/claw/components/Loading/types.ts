/**
 * 全屏 Loading 组件与工具调用相关类型
 */

export interface TypeFullScreenLoadingProps {
  className?: string;
  style?: React.CSSProperties;
  /** 是否显示 */
  visible?: boolean;
  /** 自定义文案，默认「加载中...」 */
  text?: string;
  /** 自定义 loading 图（可选），不传则用内置动效 */
  imageUrl?: string;
  /** 关闭时回调（仅组件方式可感知） */
  onClose?: () => void;
  /**
   * 是否全屏。false 时在父元素内铺满（position: absolute），父元素需有定位上下文
   * @default true
   */
  fullScreen?: boolean;
}

/** 工具调用方式返回的句柄，用于主动关闭 */
export interface TypeFullScreenLoadingHandle {
  close: () => void;
}

/** 工具/Hook 调用时的选项 */
export interface TypeFullScreenLoadingOptions {
  /** 自定义文案 */
  text?: string;
  /** 自定义 loading 图 */
  imageUrl?: string;
  /**
   * 单例 id：相同 id 的多次 show 共用一个 loading 实例，close 关闭该 id 的实例
   * 不传时使用默认 id，全局单例
   */
  id?: string;
  /**
   * 挂载的父元素。传入时在该父元素内铺满（非全屏）；不传则挂载到 body 全屏
   */
  parent?: HTMLElement | null;
}

/** useFullScreenLoading 返回值 */
export interface TypeUseFullScreenLoadingReturn {
  /** 显示 Loading，相同 id 为单例 */
  show: (options?: TypeFullScreenLoadingOptions) => TypeFullScreenLoadingHandle;
  /** 关闭指定 id 的 Loading，不传 id 时关闭默认单例 */
  close: (id?: string) => void;
}
