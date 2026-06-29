export interface TypePoint {
  x: number;
  y: number;
}

// 图层插入方式
export type TypeInsertMethod = 'block' | 'inline' | 'element' | 'relative' | TypePoint;

export interface TypeLayer {
  id: string;
  type?: string;
  icon?: any; // 图层面板上展示的图标
  displayName?: string; // 图层面板上展示的名称
  customType?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  align?: string;
  verticalAlign?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
  clipX?: number;
  clipY?: number;
  clipWidth?: number;
  clipHeight?: number;
  clipStroke?: string;
  visible?: boolean;
  draggable?: boolean;
  canDrop?: boolean;
  selected?: boolean;
  hovered?: boolean;
  loading?: boolean;

  // 拖拽数据传输
  dataTransfer?: any;
  // 拖拽数据接收
  onDropAccept?: any;

  // 自定义数据
  attributes?: { [key: string]: any };
  children?: any;
  shadowChildren?: any;

  // 事件
  onPointerEnter?: (e: any) => void;
  onPointerLeave?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerDown?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onMouseEnter?: (e: any) => void;
  onMouseLeave?: (e: any) => void;
  onMouseMove?: (e: any) => void;
  onMouseDown?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onClick?: () => void;
  onTap?: () => void;
  onDrag?: (e: any) => void;
  onDragStart?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onDragEnter?: (e: any) => void;
  onDragOver?: (e: any) => void;
  onDragLeave?: (e: any) => void;
  onDrop?: (e: any) => void;
  onTransform?: () => void;
  onBlur?: (newText: string) => void;

  // 序列化方法
  toJSON?: () => string;
  fromJSON?: (json: any) => void;

  // 选中方法
  select?: () => void;
  unselect?: () => void;

  // 渲染方法
  render?: (element: TypeLayer) => React.ReactNode;
}

export interface TypeGroup extends TypeLayer {
  type: 'group';
  layout?: 'flow' | 'absolute';
  // 是否可以把内部元素拖出容器，默认false
  canDragOut?: boolean;
  /**外部元素拖入到容器内部要怎么回应
   * 默认false，不接受拖入
   * true，接受拖入，但是要匹配允许接收的类型
   */
  canDropIn?: boolean;
  // 允许接收的类型
  acceptDropType?: string[];
}


// 图片相关操作的动作常量
export enum EnumImageAction {
  AiEdit = 'ai-edit', // AI改图
  AiOutpaint = 'ai-outpaint', // AI扩图
  AiUpscale = 'ai-upscale', // AI超清
  AiInpaint = 'ai-inpaint', // AI无痕消除
  SplitLayer = 'split-layer', // 拆分图层
  Matting = 'matting', // 抠图
  SmartTextEdit = 'smart-text-edit', // 无痕改字
  Crop = 'crop', // 裁剪
  AddToChat = 'add-to-chat', // 添加到聊天
}

// 文字相关操作的动作常量（与图片动作分离）
export enum EnumTextAction {
  ToggleBold = 'text-bold', // 加粗
  ToggleItalic = 'text-italic', // 斜体
  ToggleUnderline = 'text-underline', // 下划线
  SetFontFamily = 'text-font-family', // 字体
  SetFontSize = 'text-font-size', // 字号
  SetLineHeight = 'text-line-height', // 行高
}

/** 锚点 */
export const TRANSFORMER_ANCHORS = [
  // "top-center",
  // "bottom-center",
  // "middle-left",
  // "middle-right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as string[];

interface TypeNodeLayout {
  nodeType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children?: any[];
}

// 定位选项接口
export interface LocateOptions {
  getMemoryRect?: (_el, scale?: number, position?: { x: number; y: number }) => { x: number; y: number; width: number; height: number };

  // 定位四周留安全距离，相对像素，随着缩放变化
  margin?: number; // 边距
  marginTop?: number; // 上边距
  marginBottom?: number; // 下边距
  marginLeft?: number; // 左边距
  marginRight?: number; // 右边距

  absoluteOffsetX?: number; // X偏移，不论实际缩放多少都计算得出这个绝对像素
  absoluteOffsetY?: number; // Y偏移，不论实际缩放多少都计算得出这个绝对像素

  duration?: number; // 动画持续时间（毫秒）
  locateScale?: number; // 定位并指定缩放值
  autoSelect?: boolean; // 是否自动选中
  autoLocate?: boolean; // 是否自动定位
  insertMethod?: TypeInsertMethod; // 图层插入方式
  relativeElement?: TypeLayer; // 相对元素
}

// 定位队列数据格式
export interface LocateQueueItem {
  target?: string | string[] | "selected" | TypeLayer;
  options?: LocateOptions;
}
