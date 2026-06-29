import type { ReactNode, RefObject } from 'react';
import type { SwiperRef } from 'antd-mobile';
import type { TypeFileItem } from '@/components/InputChat/utils/fileSelector';

/**
 * useMobileImagePreview 配置选项
 */
export interface TypeMobileImagePreviewOptions {
  /** 关闭回调 */
  onClose?: () => void;
  /** 切换图片回调 */
  onChange?: (current: number, prev: number) => void;
  /** 分享回调 */
  onShare?: (
    image: TypeFileItem,
    index: number,
    images: TypeFileItem[],
  ) => void;
  /** 下载回调 */
  onDownload?: (
    image: TypeFileItem,
    index: number,
    images: TypeFileItem[],
  ) => void;
  /** 是否显示分享按钮,默认false */
  showShareButton?: boolean;
}

/**
 * useMobileImagePreview hooks 返回类型
 */
export interface TypeMobileImagePreviewReturn {
  /** 打开图片预览 */
  openPreview: (images: TypeFileItem[], currentIndex?: number) => void;
  /** 打开单张图片预览 */
  openSinglePreview: (image: TypeFileItem) => void;
  /** 关闭图片预览 */
  closePreview: () => void;
  /** 预览 Modal 组件，需要在组件中渲染 */
  PreviewModal: ReactNode;
  /** 当前图片索引 */
  currentIndex: number;
  /** 当前图片列表 */
  images: TypeFileItem[];
  /** Swiper 引用，可用于手动控制滑动 */
  swiperRef: RefObject<SwiperRef | null>;
}

export { type TypeFileItem };
