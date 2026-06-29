/**
 * CommonTable 组件类型定义
 */

/**
 * 列类型枚举
 */
export enum EnumColType {
  /** 图片类型 */
  IMAGE = 'image',
  /** 文本+图标类型 */
  TEXT_ICON = 'text_icon',
  /** 文本+链接+折叠类型 */
  TEXT_LINK_COLLAPSE = 'text_link_colapse',
  /** 普通文本类型 */
  TEXT = 'text',

  /** 文本API类型 */
  TEXT_API = 'text_api',
  /** 文本列表类型 */
  TEXT_LIST = 'text_list',

  /** 趋势线类型 */
  TREND_LINE = 'trend_line',

  /** 机会分类型 */
  OPP_SCORE = 'oppscore_col',
}

/**
 * 对齐方式枚举
 */
export enum EnumAlign {
  /** 左对齐 */
  LEFT = 'left',
  /** 居中对齐 */
  CENTER = 'center',
  /** 右对齐 */
  RIGHT = 'right',
}

export enum EnumShowType {
  /** 折叠 */
  COLLAPSE = 'collapse',
  /** 滑动 */
  SLIDE = 'slide',
}

/**
 * 表头配置类型
 */
export interface TypeTableHeader {
  /** 对齐方式 */
  align: EnumAlign | 'left' | 'center' | 'right';
  /** 表头对齐方式 */
  headerAlign?: EnumAlign | 'left' | 'center' | 'right';
  /** 列类型 */
  colType: EnumColType | string;
  /** 列键名 */
  key: string;
  /** 列标题 */
  title: string;
  /** 列宽度（可选） */
  width?: string;

  /** 表头悬浮文本 */
  headerHoverText?: string;

  /** 列属性 */
  properties?: {

    // text 类型
    showType?: EnumShowType;
    isHover?: boolean;
    isLink?: boolean;
    showRowNum?: number;


    // image 类型
    hasLink?: boolean;


    // trend_line 类型
    isBiggerHigher?: boolean;
    pointName?: string;
    title?: string;


    // text_api 类型
    apiName?: string;
    apiType?: string;

    [key: string]: any;
  };
}

/**
 * 表格元数据类型
 */
export interface TypeTableMeta {
  /** 表格标题 */
  tableTitle: string;
  /** 表格副标题 */
  tableSubTitle: string;
  /** 是否显示复选框 */
  showCheckBox?: boolean;

  /** 是否折叠 */
  isFold?: boolean;
  /** 折叠文本 */
  foldText?: string;

  /** 展开文本 */
  unfoldText?: string;
  /** 显示的行数 */
  showRowNums?: number;
  /** 行键名 */
  rowKey?: string;

  headerGroupInfo?: {
    groupName?: string;
    groupTitle?: string;
    groupHeaderList?: string[];
  };
}


/**
 * 表格数据完整结构类型
 */
export interface TypeTableData<T> {
  /** 表头配置 */
  headers: TypeTableHeader[];
  /** 表格元数据 */
  meta: TypeTableMeta;
  /** 行数据 */
  rowData: T[];
}

