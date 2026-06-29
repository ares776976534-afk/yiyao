/** 上传后在输入区展示的附件项（受控数据，非 DOM 插入） */
export type TypeClawAttachmentItem = {
  id: string;
  /** 胶囊展示名；无 fileUrl 时同时作为序列化进正文的前缀（如 @path） */
  label: string;
  /** 上传接口返回的可访问地址；有时效时用于 `[attachment:](url)` 行 */
  fileUrl?: string;
};

export type TypeClawChatComposerProps = {
  connected?: boolean;
  isRunning?: boolean;
  placeholder?: string;
  onSend?: () => void;
  onStop?: () => void;
  /** 草稿变化（用于发送按钮置灰等） */
  onDraftChange?: (payload: { isEmpty: boolean }) => void;
  /**
   * 用户拖入/选择文件后的上传逻辑；返回要在输入区展示的附件列表。
   * 上传过程中组件会进入 uploading 状态并禁用输入。
   */
  onUploadFiles?: (files: File[]) => Promise<TypeClawAttachmentItem[]>;
  /** 附件列表变化（便于父组件同步状态或埋点） */
  onAttachmentsChange?: (items: TypeClawAttachmentItem[]) => void;
};

export type TypeClawChatComposerRef = {
  getSerialized: () => string;
  clear: () => void;
  focus: () => void;
};
