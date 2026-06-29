import { Selection, CanvasCoords, ImageSize, CropRegionClassNames, StyleConfig } from "./types";
import { CANVAS_SCALE_FACTOR } from "./constants";

// 工具函数：获取图片原始尺寸
export const getImageNaturalSize = (
  src: string
): Promise<ImageSize> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
};

// 工具函数：坐标转换
export const convertCoordinates = {
  // 将自然坐标转换为canvas坐标
  naturalToCanvas: (
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    naturalWidth: number,
    naturalHeight: number,
    canvasWidth: number,
    canvasHeight: number
  ): CanvasCoords => {
    const scaleX = canvasWidth / naturalWidth;
    const scaleY = canvasHeight / naturalHeight;
    return {
      x1: x1 * scaleX,
      x2: x2 * scaleX,
      y1: y1 * scaleY,
      y2: y2 * scaleY,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY,
    };
  },

  // 将canvas坐标转换为自然坐标
  canvasToNatural: (
    selection: Selection,
    naturalWidth: number,
    naturalHeight: number,
    canvasWidth: number,
    canvasHeight: number
  ): number[] => {
    const scaleX = naturalWidth / canvasWidth;
    const scaleY = naturalHeight / canvasHeight;
    return [
      Math.round(selection.x * scaleX),
      Math.round((selection.x + selection.width) * scaleX),
      Math.round(selection.y * scaleY),
      Math.round((selection.y + selection.height) * scaleY),
    ];
  },

  // 将canvas坐标转换为遮罩样式
  canvasToMaskStyle: (
    selection: Selection,
    displayWidth: number,
    displayHeight: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const scaleX = displayWidth / canvasWidth;
    const scaleY = displayHeight / canvasHeight;
    const scaledX = selection.x * scaleX;
    const scaledY = selection.y * scaleY;
    const scaledWidth = selection.width * scaleX;
    const scaledHeight = selection.height * scaleY;

    return {
      left: scaledX,
      top: scaledY,
      bottom: displayHeight - scaledY - scaledHeight,
      right: displayWidth - scaledX - scaledWidth,
    };
  },
};

// 计算Canvas尺寸
export const calculateCanvasSize = (displaySize: ImageSize): ImageSize => {
  if (!displaySize.width || !displaySize.height) {
    return { width: 0, height: 0 };
  }
  return {
    width: displaySize.width * CANVAS_SCALE_FACTOR,
    height: displaySize.height * CANVAS_SCALE_FACTOR,
  };
};

// 计算初始选区
export const calculateInitialSelection = (
  canvasSize: ImageSize,
  scale: number
): Selection => {
  return {
    x: (canvasSize.width * (1 - scale)) / 2,
    y: (canvasSize.height * (1 - scale)) / 2,
    width: canvasSize.width * scale,
    height: canvasSize.height * scale,
  };
};

/**
 * 合并CSS类名
 * @param defaultClassName 默认类名（来自CSS Modules）
 * @param overrideClassName 覆盖类名（外部自定义）
 * @returns 合并后的类名字符串
 */
export const mergeClassName = (
  defaultClassName?: string,
  overrideClassName?: string
): string => {
  if (overrideClassName) {
    return overrideClassName;
  }
  return defaultClassName || '';
};

/**
 * 创建类名获取器函数
 * @param defaultStyles 默认样式对象（CSS Modules）
 * @param classNameOverrides 类名覆盖配置
 * @returns 类名获取函数
 */
export const createClassNameGetter = (
  defaultStyles: Record<string, string>,
  classNameOverrides?: CropRegionClassNames
) => {
  try {
    return (key: keyof CropRegionClassNames, fallbackKey?: string): string => {
      const overrideClassName = classNameOverrides?.[key];
      const defaultClassName = defaultStyles[fallbackKey || key as string];
      return mergeClassName(defaultClassName, overrideClassName);
    };
  } catch (error) {
    console.error('createClassNameGetter error', error);
    return '';
  }
};
// 驼峰转短横线
const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};
/**
 * 生成样式覆盖对象
 * 支持驼峰写法和短横线写法
 * @param styleConfig 样式配置对象
 * @returns CSS样式对象
 */
export const generateStyleOverrides = (styleConfig?: StyleConfig): React.CSSProperties => {
  if (!styleConfig) return {};

  const styleVars: Record<string, string> = {};

  Object.entries(styleConfig).forEach(([key, value]) => {
    let cssVarName: string;

    if (key.startsWith('--')) {
      // 已经是完整的CSS变量名
      cssVarName = key;
    } else {
      // 处理驼峰和短横线写法
      const kebabKey = camelToKebab(key);
      cssVarName = `--${kebabKey}`;
    }

    styleVars[cssVarName] = value;
  });

  return styleVars as React.CSSProperties;
};

// 默认CSS变量配置
export const DEFAULT_CSS_VARIABLES = {
  '--global-border-radius': '6px',
  '--brand-color': '#6150FF',
  '--bg-color': 'rgba(0, 0, 0, 0.08)',
  '--main-font-color': 'rgba(0, 0, 0, 0.87)',
  '--sub-font-color': 'rgba(0, 0, 0, 0.6)',
  '--light-bg-color': 'rgba(0, 0, 0, 0.04)',
  '--light-border-color': 'rgba(0, 0, 0, 0.15)',
  '--cropper-search-image-width': '160px',
  '--cropper-search-image-height': '160px',
  '--cropper-viewer-radius': '6px',
  '--cropper-cut-btn-radius': '4px',
  '--cropper-popover-inner-padding': '0',
  '--cropper-popover-inner-border-radius': '6px',
};

// 默认字体样式
export const DEFAULT_FONT_STYLES: React.CSSProperties = {
  fontSize: '14px',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
  fontVariant: 'tabular-nums',
  lineHeight: '1.5715',
};

// 坐标分隔符 - 用于分隔x1,x2,y1,y2坐标
export const COORDINATE_SEPARATOR = ',';

// 区域分隔符 - 用于分隔多个裁剪区域
export const REGION_SEPARATOR = ';';
/**
 * 将坐标字符串转换为数组
 * @param coordinateStr 坐标字符串 "x1,x2,y1,y2"
 * @returns 坐标数组 [x1, x2, y1, y2]
 */
export const stringToCoordinates = (coordinateStr: string): number[] => {
  return coordinateStr.split(COORDINATE_SEPARATOR).map(Number);
};

/**
 * 分割多个区域字符串
 * @param regionsStr 区域字符串 "region1;region2;region3"
 * @returns 过滤后的区域数组
 */
export const splitRegions = (regionsStr: string): string[] => {
  if (!regionsStr) return [];

  return regionsStr
    .split(REGION_SEPARATOR)
    .map(item => item.trim())
    .filter(item => item !== '');
};

/**
 * 将坐标数组转换为字符串
 * @param coordinates 坐标数组 [x1, x2, y1, y2]
 * @returns 坐标字符串 "x1,x2,y1,y2"
 */
export const coordinatesToString = (coordinates: number[]): string => {
  return coordinates.join(COORDINATE_SEPARATOR);
};