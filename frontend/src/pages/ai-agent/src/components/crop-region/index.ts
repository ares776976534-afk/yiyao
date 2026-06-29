// 导出主组件
export { default } from "./main";

// 导出类型定义
export type { Selection, ImageSize, ViewerItem } from "./types";

// 导出工具函数（如果需要外部使用）
export { convertCoordinates, getImageNaturalSize } from "./utils";

// 导出常量（如果需要外部使用）
export { THUMBNAIL_SIZE, INIT_SELECTION_SCALE } from "./constants"; 