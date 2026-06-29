// 类型定义
export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasCoords {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  width: number;
  height: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface ViewerItem {
  cropRegion: number[];
  maskStyle: any;
  selection: Selection;
}

// 裁剪区域国际化文案
export interface ImageCrooperLocale {
  TEXT_CONFIRM: React.ReactNode; // 确定
  TEXT_CANCEL: React.ReactNode; // 取消
  TEXT_SELECT: React.ReactNode; // 框选主体
}
// 定义样式配置接口，支持任意CSS变量的覆盖
export interface StyleConfig {
  // 支持任意CSS变量名及其值的映射
  [key: string]: string;
}
export interface CropRegionProps {
  cropImage: string;
  currentRegion: string;
  yoloCropRegion: string;
  onCropChange: (cropRegion: number[], originYoloCropRegion: string) => void;
  onCropClick: (cropRegion: string) => void;
  locale?: ImageCrooperLocale;
  styleConfig?: StyleConfig; // 样式配置，支持单独使用时覆盖默认样式
  classNameOverrides?: CropRegionClassNames; // CSS类名覆盖配置，允许外部完全自定义样式
  viewerListClassName?: string; // 为viewerList添加自定义类名，支持伪元素等高级样式
  disabled?: boolean; // 是否禁用
}
// 裁剪区域CSS类名覆盖配置
export interface CropRegionClassNames {
  container?: string; // cropper-container
  selectionContainer?: string; // cropper-selection-container
  selectionImage?: string; // cropper-selection-image
  maskContainer?: string; // cropper-mask-container
  imageMask?: string; // cropper-image-mask
  cutBtn?: string; // cropper-cut-btn
  cutIcon?: string; // cropper-cut-icon
  viewerList?: string; // cropper-viewer-list
  viewerItem?: string; // cropper-viewer-item
  viewerItemActive?: string; // cropper-viewer-item active状态
  viewerItemMask?: string; // cropper-viewer-item-mask
  viewerItemImage?: string; // cropper-viewer-item-image
  popover?: string; // cropper-popover
  popoverContainer?: string; // cropper-popover-container
  popoverContent?: string; // cropper-popover-content
  popoverFooter?: string; // cropper-popover-footer
  popoverFooterConfirm?: string; // cropper-popover-footer-confirm
  popoverFooterCancel?: string; // cropper-popover-footer-cancel
  viewerItemCheckMark?: string; // cropper-viewer-check-mark
}