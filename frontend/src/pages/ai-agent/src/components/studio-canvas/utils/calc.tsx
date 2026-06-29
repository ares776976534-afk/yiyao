import { TypeLayer } from '../types.d';
import { getBoundingClientRect } from './node';

// 文本尺寸测量接口
export interface TextSizeResult {
  width: number;
  height: number;
}

// 元素边界框接口
export interface ElementBounds {
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

// 插入位置接口
export interface InsertPosition {
  x: number;
  y: number;
}

// 定位选项接口
export interface LocateOptions {
  padding?: number;
  smooth?: boolean;
  duration?: number;
}

// 焦点区域接口
export interface ViewportRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface El extends TypeLayer {
  getClientRect?: () => { x: number; y: number; width: number; height: number };
  getMemoryRect?: (_el, scale: number, position: { x: number; y: number }) => { x: number; y: number; width: number; height: number };
}

/**
 * 精确测量文本尺寸
 * @param text 文本内容
 * @param fontSize 字体大小
 * @param fontFamily 字体族
 * @returns 文本尺寸
 */
export const measureTextSize = (text: string, fontSize: number, fontFamily: string): TextSizeResult => {
  // 创建临时canvas进行文本测量
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // 回退到估算
    return {
      width: text.length * fontSize * 0.6,
      height: fontSize * 1.2,
    };
  }

  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);

  // 精确计算文本高度
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  return {
    width: metrics.width,
    height: height || fontSize, // 如果浏览器不支持actualBoundingBox，回退到fontSize
  };
};

/**
 * 计算多个元素的总边界框
 * @param elements 元素数组
 * @param textMinWidth 文本最小宽度
 * @returns 总边界框或 null
 */
export const calculateTotalBounds = (elements: El[], stage: any): ElementBounds => {
  if (elements.length === 0) {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  }

  const scale = stage.scaleX();

  const bounds = elements.filter(element => element.visible !== false).map(element => {
    const el = typeof element === 'string' ? { id: element } : element;
    let rect = { x: 0, y: 0, width: 0, height: 0 };
    const node = stage.findOne(`#${el.id}`);

    if (node) {
      rect = getBoundingClientRect(node);
    } else if (el?.getClientRect) {
      rect = el?.getClientRect();
    } else if (el?.getMemoryRect) {
      rect = el?.getMemoryRect(el, scale, stage.position());
    } else if (el.hasOwnProperty('x') && el.hasOwnProperty('y') && el.hasOwnProperty('width') && el.hasOwnProperty('height')) {
      rect = {
        x: el.x || 0,
        y: el.y || 0,
        width: el.hasOwnProperty('maxWidth') ? Math.min(el.width || 0, el.maxWidth || 0) : el.width || 0,
        height: el.hasOwnProperty('maxHeight') ? Math.min(el.height || 0, el.maxHeight || 0) : el.height || 0
      };
    }

    return {
      x: rect.x,
      y: rect.y,
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      width: rect.width,
      height: rect.height,
    };
  });
  const minX = Math.min(...bounds.map(b => b.x));
  const minY = Math.min(...bounds.map(b => b.y));
  const maxX = Math.max(...bounds.map(b => b.right));
  const maxY = Math.max(...bounds.map(b => b.bottom));

  return {
    x: minX,
    y: minY,
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// 画布中心点是基于浏览器适口的值，不参与画布的位移和缩放，应该由画布上的元素处理画布的位移坐标和缩放
export const calViewportRect = (stage: any, viewport: ViewportRect = { left: 0, top: 0, right: 0, bottom: 0 }) => {
  let { left, top, right, bottom } = viewport || {};
  let width = (right - left) || 0;
  let height = (bottom - top) || 0;

  if (width <= 0 || height <= 0) {
    left = 0;
    top = 0;
    width = stage.width;
    height = stage.height;
  }

  // 画布左移，x轴为负数；画布上移，y轴为负数
  const centerX = (width + viewport.left) / 2;
  const centerY = (height + viewport.top) / 2;

  return {
    centerX,
    centerY,
    width,
    height,
  };
};

/**
 * 缓动函数：easeOut（二次方）
 * @param progress 进度值 (0-1)
 * @returns 缓动后的进度值
 */
export const easeOut = (progress: number): number => {
  return 1 - Math.pow(1 - progress, 2);
};

/**
 * 缓动函数：easeOutCubic（三次方）
 * @param progress 进度值 (0-1)
 * @returns 缓动后的进度值
 */
export const easeOutCubic = (progress: number): number => {
  return 1 - Math.pow(1 - progress, 3);
};

/**
 * 计算动画的当前值
 * @param startValue 起始值
 * @param endValue 结束值
 * @param progress 进度值 (0-1)
 * @param easing 缓动函数
 * @returns 当前值
 */
export const calculateAnimationValue = (
  startValue: number,
  endValue: number,
  progress: number,
  easing: (p: number) => number = easeOutCubic
): number => {
  const easedProgress = easing(progress);
  return startValue + (endValue - startValue) * easedProgress;
};

// 在图片的真实尺寸和设定尺寸之间选择合适的
export const calcImageSize = (originSize: { width: number, height: number } | HTMLImageElement, targetSize: { width: number, height: number } = { width: 0, height: 0 }) => {
  /**
   * 1. 未指定宽高，使用图片真实宽宽
   * 2. 指定了宽，没指定高。宽度使用指定的，高度通过真实高度等比计算
   * 3. 指定了高，没指定宽。高度使用指定的，宽度通过真实宽度等比计算
   * 4. 指定了宽高，使用指定的宽高不用真实的宽高
   */
  if (!targetSize.width && !targetSize.height) {
    return originSize
  } else if (targetSize.width && targetSize.height) {

    return targetSize
  } else if (targetSize.width && !targetSize.height) {
    return {
      width: targetSize.width,
      height: originSize.height * (targetSize.width / originSize.width),
    };
  } else if (targetSize.height && !targetSize.width) {
    return {
      width: originSize.width * (targetSize.height / originSize.height),
      height: targetSize.height,
    };
  }

  return originSize;
};
