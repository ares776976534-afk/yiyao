import type { TypeOfferMaterialResult } from "@/services/studio/queryOfferBy";
import type { TypeFileItem, TypeImageFromUrl } from "./utils/fileSelector";
import type { TypeMobileImagePreviewReturn } from "@/components/MobileImagePreview";

export const OFFER = "offer";

export interface TypeOfferItem {
  id: string;
  type: typeof OFFER;
  offer: TypeOfferMaterialResult;
}

export type TypeUploadItem = TypeFileItem | TypeOfferItem;

// 定义统一添加内容的类型
export type TypeContentItem =
  | { type: "text"; data: string }
  | { type: "image"; data: TypeImageFromUrl[] }
  | { type: "offer"; data: TypeOfferMaterialResult[] };

export interface TypeInputChatRef {
  addTextToChat: (content: string, append?: boolean) => void;
  addImagesToChat: (content: TypeImageFromUrl[], append?: boolean) => void;
  addImagesFromFilesToChat: (items: TypeFileItem[], append?: boolean) => void;
  addOffersToChat: (
    content: TypeOfferMaterialResult[],
    append?: boolean,
  ) => void;
  addContentToChat: (contentList: TypeContentItem[]) => void;
  setStatus: (status: Status) => void;
}

/**
 * 对话框状态枚举
 * 定义对话框在不同交互阶段的状态
 * 默认状态：输入框为空，且没有图片/视频/商品链接，发送按钮设置为禁用，但不禁用商品和图片的上传
 * 唤醒状态：输入框有内容或有图片/视频/商品链接，发送按钮设置为启用，不影响商品和图片的上传
 * 运行状态：正在进行流式输出，禁用所有可操作项
 * 加载状态：正在进行加载，发送按钮设置为加载中，不影响商品和图片的上传
 */
export enum Status {
  /** 默认状态 - 初始状态，输入框为空，且没有图片/视频/商品链接，发送按钮设置为禁用，但不禁用商品和图片的上传 */
  DEFAULT = "default",
  /** 可发送状态 - 输入框有内容或有图片/视频/商品链接 */
  READY = "ready",
  /** 禁用状态 - 输入框为空，且没有图片/视频/商品链接，禁用所有可操作项 */
  DISABLED = "disabled",
  /** 运行状态 - 正在进行流式输出 */
  RUNNING = "running",
  /** 暂停状态 - 暂停流式输出 */
  PAUSED = "paused",
  /** 加载状态 - 正在进行加载 */
  LOADING = "loading",
}

export interface TypeInputChatProps {
  /** 是否是移动端 */
  isMobile?: boolean;
  /** 对话框placeholder */
  placeholder?: string;
  /** 是否显示商品链接上传按钮 - 默认显示 */
  showUploadOffer?: boolean;
  /** 是否显示图片上传按钮 - 默认显示 */
  showUploadImage?: boolean;
  /** 对话框状态 - 完全受控，必须由外部传入 */
  status: Status;
  /** 对话框数据 - 对话框的输入内容和附件 */
  inputChatData: TypeUploadItem[];
  /** 对话框最小高度 */
  chatInputMinHeight?: number;
  /** 对话框最大高度 */
  chatInputMaxHeight?: number;
  /** 上传组件紧凑模式 */
  uploadCompact?: boolean;
  /** 上传组件紧凑配置 */
  uploadCompactConfig?: any;
  /** 自定义发送按钮 */
  sendButton?: React.ReactNode;
  /** 对话框数据变更回调 - 当对话框数据变更时调用，外部需要响应此回调并更新传入的inputChataData */
  onInputChataDataChange?: (data: TypeUploadItem[]) => void;
  /** 状态变更回调 - 当需要更新状态时调用，外部需要响应此回调并更新传入的status */
  onStatusChange?: (status: Status) => void;
  /** 自定义消息发送处理函数 - 当用户点击发送按钮时调用 */
  onSendMessage?: (data: any) => void;
  /** 商品链接分析按钮点击回调 - 当用户点击商品链接按钮时调用 */
  onOfferLinkClick?: () => void;
  /** 自定义图片预览 hooks 返回值 - 用于自定义图片预览逻辑 */
  imagePreview?: TypeMobileImagePreviewReturn;

  /** 自定义日志配置 */
  logMaps?: {
    send?: string;
    enhanced?: string;
    uploadimg?: string;
    uploaditemurl?: string;
  };
}

export { TypeFileItem, TypeImageFromUrl };

export interface TypeVideoData {
  coverUrl: string;
  url: string;
  width?: number;
  height?: number;
}
