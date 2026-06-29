import { v4 as uuidv4 } from "uuid";
import { $t } from "@/i18n";

// 图片格式配置
export const IMAGE_ACCEPT_MINI_TYPE = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  // "bmp",
  // "gif",
  // "svg",
];

// 支持的图片格式，完整版代码用
export const IMAGE_ACCEPT_TYPE = IMAGE_ACCEPT_MINI_TYPE.map(
  (type) => `image/${type}`,
);

// 视频格式配置
export const VIDEO_ACCEPT_MINI_TYPE = ["mp4", "mov"];
// 与扩展名对应的常见 MIME 类型（mov 通常为 video/quicktime）
export const VIDEO_ACCEPT_TYPE = ["video/mp4", "video/quicktime"];

// 通用函数：生成 accept 字符串与 MIME 判断
export const imageAcceptString = (): string => IMAGE_ACCEPT_TYPE.join(",");
export const videoAcceptString = (): string => VIDEO_ACCEPT_TYPE.join(",");
export const imagesAndVideosAcceptString = (): string =>
  `${imageAcceptString()},${videoAcceptString()}`;
export const isImageMimeType = (mime: string): boolean =>
  IMAGE_ACCEPT_TYPE.includes(mime);
export const isVideoMimeType = (mime: string): boolean =>
  VIDEO_ACCEPT_TYPE.includes(mime);

export const IMAGE = "image";
export const VIDEO = "video";

// 通用媒体类型判断：返回 'image' | 'video'，都不是时返回空字符串
export const detectMediaType = (mime: string): typeof IMAGE | typeof VIDEO => {
  if (isImageMimeType(mime)) return IMAGE;
  if (isVideoMimeType(mime)) return VIDEO;
  // 回退策略：未知 MIME 时按图片处理（更安全，仍可作为缩略展示）
  return IMAGE;
};

// 文件大小限制配置（MB）
export const FILE_SIZE_LIMITS_MB = {
  IMAGE: 15, // 图片最大上传限制（MB）
  VIDEO: 1024, // 视频最大上传限制（MB）
} as const;

// 文件大小限制配置（字节）
export const FILE_SIZE_LIMITS = {
  IMAGE: FILE_SIZE_LIMITS_MB.IMAGE * 1024 * 1024,
  VIDEO: FILE_SIZE_LIMITS_MB.VIDEO * 1024 * 1024,
} as const;

// 图片尺寸限制配置（px）
export const IMAGE_DIMENSION_LIMITS = {
  MIN: 512, // 图片最小尺寸（px）
  MAX: 3000, // 图片最大尺寸（px）
} as const;

// 文件状态枚举
export enum TypeFileState {
  appended = "appended", // 文件已添加
  uploading = "uploading", // 正在上传/处理
  ready = "ready", // 准备就绪/完成
  error = "error", // 错误状态
}

// 文件项类型
export interface TypeFileItem {
  type: typeof IMAGE | typeof VIDEO;
  id: string;
  file: File;
  state: TypeFileState;
  progress: number;
  error?: string;
  imagePreviewUrl?: string;
  videoPreviewUrl?: string;
  width?: number;
  height?: number;
  // 原始视频的宽高（与预览图宽高区分开）
  videoWidth?: number;
  videoHeight?: number;
}

// 错误类型定义
export interface FileSelectorError {
  type: "VALIDATION_FAILED";
  message: string;
}

export interface TypeImageFromUrl {
  url: string;
  width: number;
  height: number;
}

// 类型定义
interface FileSelectorOptions {
  accept?: string;
  multiple?: boolean;
  validator?: (file: File) => boolean | FileSelectorError;
  // 选择完成后、进入加载前的钩子：可用于拦截或裁剪文件列表
  // 支持异步。返回 null/空数组则视为取消上传
  beforeUpload?: (files: File[]) => File[] | null | Promise<File[] | null>;
  onStateChange?: (state: { isSelecting: boolean }) => void;
  onProgress?: (progress: { progress: number }) => void;
  onFileProgress?: (fileItems: TypeFileItem[]) => void;
}

interface FileSelectorState {
  isSelecting: boolean;
}

interface ProgressData {
  progress: number;
  fileItems?: TypeFileItem[];
}

interface StateChangeData {
  isSelecting: boolean;
}

// 事件映射类型
interface EventMap {
  stateChange: StateChangeData;
  progress: ProgressData;
}

export class FileSelectorException extends Error {
  public type: FileSelectorError["type"];

  constructor(type: FileSelectorError["type"], message: string) {
    super(message);
    this.name = "FileSelectorException";
    this.type = type;
  }
}

/**
 * 文件选择器状态管理
 * 导出FileSelector类，供外部直接使用
 */
export class FileSelector {
  private isSelecting: boolean = false;
  private fileItems: TypeFileItem[] = [];
  private currentProgress: number = 0;
  private listeners: {
    [K in keyof EventMap]: Array<(data: EventMap[K]) => void>;
  } = {
    stateChange: [],
    progress: [],
  };

  // 添加状态监听器
  on<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void,
  ): void {
    this.listeners[event].push(callback);
  }

  // 移除状态监听器
  off<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void,
  ): void {
    const listeners = this.listeners[event];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // 触发事件
  private emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners[event].forEach((callback) => callback(data));
  }

  // 更新文件元信息（不硬编码键名）
  updateFileMeta(fileId: string, meta: Partial<TypeFileItem>): void {
    const fileItem = this.fileItems.find((item) => item.id === fileId);
    if (!fileItem) return;
    Object.assign(fileItem, meta);
    this.updateProgress();
  }

  // 重置进度状态
  private resetProgress(): void {
    this.currentProgress = 0;
    this.emit("progress", {
      progress: 0,
      fileItems: [],
    });
  }

  // 设置选择状态
  setSelecting(isSelecting: boolean): void {
    this.isSelecting = isSelecting;

    // 当开始选择时，重置进度
    if (isSelecting) {
      this.resetProgress();
    }

    this.emit("stateChange", { isSelecting });
  }

  // 初始化文件列表
  initFileItems(files: File[]): void {
    this.fileItems = files.map((file) => {
      const mime = file.type || "";
      const type = detectMediaType(mime);
      return {
        id: uuidv4(),
        file,
        state: TypeFileState.appended,
        progress: 0,
        type,
      };
    });
    this.updateProgress();
  }

  // 更新单个文件进度
  updateFileProgress(
    fileId: string,
    progress: number,
    state?: TypeFileState,
    error?: string,
  ): void {
    const fileItem = this.fileItems.find((item) => item.id === fileId);
    if (fileItem) {
      fileItem.progress = progress;
      if (state) fileItem.state = state;
      if (error) fileItem.error = error;
      this.updateProgress();
    }
  }

  // 计算总进度并触发事件
  private updateProgress(): void {
    const totalProgress = this.getTotalProgress();
    this.currentProgress = totalProgress;
    this.emit("progress", {
      progress: totalProgress,
      fileItems: [...this.fileItems],
    });
  }

  // 计算所有文件总进度
  private getTotalProgress(): number {
    if (this.fileItems.length === 0) return 0;

    let totalProgress = this.fileItems.reduce((acc, f: TypeFileItem) => {
      return (acc += f.state === TypeFileState.error ? 100 : f.progress);
    }, 0);
    return Math.floor(totalProgress / this.fileItems.length);
  }

  // 获取当前状态
  getState(): FileSelectorState {
    return { isSelecting: this.isSelecting };
  }

  // 获取文件列表
  getFileItems(): TypeFileItem[] {
    return [...this.fileItems];
  }

  // 清理文件列表
  clearFileItems(): void {
    this.fileItems = [];
    this.currentProgress = 0;
    // 清理时发送最终的空状态
    this.emit("progress", {
      progress: 0,
      fileItems: [],
    });
  }

  // 获取当前进度
  getCurrentProgress(): number {
    return this.currentProgress;
  }

  // 内部重置方法，不对外暴露
  private reset(): void {
    this.isSelecting = false;
    this.fileItems = [];
    this.currentProgress = 0;
    this.emit("stateChange", { isSelecting: false });
    this.emit("progress", {
      progress: 0,
      fileItems: [],
    });
  }

  // 内部方法：准备新的文件选择
  private prepareForNewSelection(): void {
    this.reset();
  }

  // 直接设置对外展示的文件项（用于拖拽等外部场景写回）
  public setFileItemsDirect(items: TypeFileItem[]): void {
    this.fileItems = [...items];
    // 以文件自身进度计算总进度
    this.updateProgress();
  }

  // 按 id 删除单个文件项
  public removeFileItemById(fileId: string): void {
    this.fileItems = this.fileItems.filter((item) => item.id !== fileId);
    this.updateProgress();
  }
}

// 基于文件大小的渐进式进度模拟
const simulateProgressiveFileProgress = (
  fileId: string,
  file: File,
  fromState: TypeFileState,
  toState: TypeFileState,
  instance: FileSelector,
): Promise<void> => {
  return new Promise((resolve) => {
    // 根据文件大小决定步数，大文件更多步数
    const fileSizeMB = file.size / (1024 * 1024);
    const baseSteps = 10;
    const steps = Math.max(baseSteps, Math.min(50, Math.floor(fileSizeMB * 2)));

    let currentStep = 0;

    // 设置初始状态
    instance.updateFileProgress(fileId, 0, fromState);

    const updateProgress = () => {
      currentStep++;

      // 使用非线性进度，开始快，后面慢
      const linearProgress = currentStep / steps;
      const easedProgress = 1 - Math.pow(1 - linearProgress, 2); // ease-out
      const progress = Math.min(easedProgress * 100, 100);

      if (currentStep >= steps) {
        // 先把进度推进到 99%，保留最后 1% 直到尺寸获取完成
        instance.updateFileProgress(fileId, 99, fromState);
        const mime = file.type || "";

        // 图片：使用Image API获取尺寸
        if (isImageMimeType(mime)) {
          getImageDimensions(file)
            .then(({ width, height }) => {
              instance.updateFileMeta(fileId, {
                width,
                height,
              });
              // 尺寸获取完成后再置为 100 且切换到目标状态
              instance.updateFileProgress(fileId, 100, toState);
              resolve();
            })
            .catch(() => {
              // 忽略获取失败
              instance.updateFileProgress(fileId, 100, toState);
              resolve();
            });
        } else {
          // 非图片，直接完成
          instance.updateFileProgress(fileId, 100, toState);
          resolve();
        }
      } else {
        instance.updateFileProgress(fileId, progress, fromState);
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  });
};

// 批量处理文件进度
const simulateBatchFileProgress = (
  fileItems: TypeFileItem[],
  fromState: TypeFileState,
  toState: TypeFileState,
  instance: FileSelector,
): Promise<void> => {
  return new Promise((resolve) => {
    const totalFiles = fileItems.length;
    let completedFiles = 0;

    // 为每个文件启动进度模拟
    fileItems.forEach((item, index) => {
      // 错开开始时间，避免所有文件同时完成
      const delay = index * 2; // 每个文件延迟2帧

      const startProgress = () => {
        simulateProgressiveFileProgress(
          item.id,
          item.file,
          fromState,
          toState,
          instance,
        ).then(() => {
          completedFiles++;
          if (completedFiles === totalFiles) {
            resolve();
          }
        });
      };

      if (delay === 0) {
        startProgress();
      } else {
        // 使用递归的requestAnimationFrame实现延迟
        const delayFrames = (remaining: number) => {
          if (remaining <= 0) {
            startProgress();
          } else {
            requestAnimationFrame(() => delayFrames(remaining - 1));
          }
        };
        delayFrames(delay);
      }
    });
  });
};

// 单例 input
let globalFileInput: HTMLInputElement | null = null;

const removeFileInput = (): void => {
  if (globalFileInput?.parentNode) {
    globalFileInput.parentNode.removeChild(globalFileInput);
    globalFileInput = null;
  }
};

const createFileInput = (): HTMLInputElement => {
  removeFileInput();

  globalFileInput = document.createElement("input");
  globalFileInput.type = "file";
  globalFileInput.style.position = "fixed";
  globalFileInput.style.top = "-9999px";
  globalFileInput.style.left = "-9999px";
  globalFileInput.style.opacity = "0";
  globalFileInput.style.pointerEvents = "none";
  document.body.appendChild(globalFileInput);

  return globalFileInput;
};

/**
 * 选择文件 - 核心文件选择器
 */
const selectFiles = (
  options: FileSelectorOptions & { instance?: FileSelector } = {},
): Promise<File | File[]> => {
  const {
    accept = "*/*",
    multiple = false,
    validator = null,
    beforeUpload = null,
    onStateChange = null,
    onProgress = null,
    onFileProgress = null,
    instance = new FileSelector(),
  } = options;

  return new Promise<File | File[]>((resolve, reject) => {
    // 在开始前确保状态是干净的（内部调用，不对外暴露）
    (instance as any).prepareForNewSelection();

    // 设置状态监听器
    const stateChangeHandler = (data: StateChangeData) => {
      if (onStateChange) onStateChange(data);
    };

    const progressHandler = (data: ProgressData) => {
      if (onProgress) onProgress({ progress: data.progress });
      if (onFileProgress && data.fileItems) onFileProgress(data.fileItems);
    };

    instance.on("stateChange", stateChangeHandler);
    instance.on("progress", progressHandler);

    // 创建 input
    const input = createFileInput();
    input.accept = accept;
    input.multiple = multiple;

    // 清理函数
    const cleanup = (): void => {
      // 移除监听器
      instance.off("stateChange", stateChangeHandler);
      instance.off("progress", progressHandler);

      // 重置状态
      instance.setSelecting(false);

      // 移除 input
      removeFileInput();
    };

    // 监听文件选择事件
    const handleChange = async (event: Event): Promise<void> => {
      try {
        const target = event.target as HTMLInputElement;
        const rawFiles = Array.from(target.files || []);

        if (rawFiles.length === 0) {
          cleanup();
          return;
        }

        let files: File[] | null = rawFiles;
        if (typeof beforeUpload === "function") {
          try {
            const result = beforeUpload(rawFiles);
            files =
              result && typeof (result as any).then === "function"
                ? await (result as Promise<File[] | null>)
                : (result as File[] | null);
          } catch (e) {
            files = null;
          }
        }

        if (!files || files.length === 0) {
          cleanup();
          return;
        }

        instance.setSelecting(true);
        instance.initFileItems(files as File[]);
        const fileItems = instance.getFileItems();

        if (validator) {
          for (const item of fileItems) {
            const validationResult = validator(item.file);

            if (validationResult !== true) {
              const errorMessage =
                typeof validationResult === "object" && validationResult.message
                  ? validationResult.message
                  : $t(
                      "global-1688-ai-app.InputChat.fileSelector.fileVerificationfailed",
                      "文件验证失败",
                    );

              instance.updateFileProgress(
                item.id,
                100,
                TypeFileState.error,
                errorMessage,
              );
              cleanup();

              if (
                typeof validationResult === "object" &&
                validationResult.type
              ) {
                reject(
                  new FileSelectorException(
                    validationResult.type,
                    errorMessage,
                  ),
                );
              } else {
                reject(
                  new FileSelectorException("VALIDATION_FAILED", errorMessage),
                );
              }
              return;
            }
          }
        }

        await simulateBatchFileProgress(
          fileItems,
          TypeFileState.uploading,
          TypeFileState.ready,
          instance,
        );

        instance.clearFileItems();
        cleanup();

        resolve(multiple ? (files as File[]) : (files as File[])[0]);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    input.addEventListener("change", handleChange, { once: true });

    input.addEventListener(
      "cancel",
      () => {
        cleanup();
      },
      { once: true },
    );

    // 触发文件选择对话框
    input.click();
  });
};

// 创建新的文件选择器实例
export const createFileSelector = (): FileSelector => {
  return new FileSelector();
};

// 通用：格式化不合规文件数量的错误提示
export const formatInvalidFilesMessage = (invalidCount: number): string => {
  const countText = $t(
    "global-1688-ai-app.InputChat.fileSelector.gfileError",
    `${invalidCount}个文件错误`,
    [invalidCount],
  );
  return $t(
    "global-1688-ai-app.InputChat.fileSelector.jolmso",
    `仅支持上传图片${IMAGE_ACCEPT_MINI_TYPE.join(
      "、",
    )}格式；视频${VIDEO_ACCEPT_MINI_TYPE.join("、")}格式：${countText}`,
    [
      IMAGE_ACCEPT_MINI_TYPE.join("、"),
      VIDEO_ACCEPT_MINI_TYPE.join("、"),
      countText,
    ],
  );
};

// 图片：格式化不合规文件数量的错误提示
export const formatInvalidImagesMessage = (invalidCount: number): string => {
  const countText = $t(
    "global-1688-ai-app.InputChat.fileSelector.gfileError",
    `${invalidCount}个文件错误`,
    [invalidCount],
  );
  return $t(
    "global-1688-ai-app.InputChat.fileSelector.jolms",
    `仅支持上传图片${IMAGE_ACCEPT_MINI_TYPE.join("、")}格式：${countText}`,
    [IMAGE_ACCEPT_MINI_TYPE.join("、"), countText],
  );
};

// 视频：格式化不合规文件数量的错误提示
export const formatInvalidVideosMessage = (invalidCount: number): string => {
  const countText = $t(
    "global-1688-ai-app.InputChat.fileSelector.gfileError",
    `${invalidCount}个文件错误`,
    [invalidCount],
  );
  return $t(
    "global-1688-ai-app.InputChat.fileSelector.jolis",
    `仅支持上传视频${VIDEO_ACCEPT_MINI_TYPE.join("、")}格式：${countText}`,
    [VIDEO_ACCEPT_MINI_TYPE.join("、"), countText],
  );
};

// 图片文件验证器
export const validateImage = (file: File): boolean | FileSelectorError => {
  // 检查文件类型是否在支持的图片格式中
  if (!isImageMimeType(file.type)) {
    return {
      type: "VALIDATION_FAILED",
      message: $t(
        "global-1688-ai-app.InputChat.fileSelector.qcialps",
        `请选择有效的图片文件，支持格式：${IMAGE_ACCEPT_MINI_TYPE.join(", ")}`,
        [IMAGE_ACCEPT_MINI_TYPE.join(", ")],
      ),
    };
  }
  return true;
};

// 视频文件验证器
export const validateVideo = (file: File): boolean | FileSelectorError => {
  if (!isVideoMimeType(file.type)) {
    return {
      type: "VALIDATION_FAILED",
      message: $t(
        "global-1688-ai-app.InputChat.fileSelector.qcidlps",
        `请选择有效的视频文件，支持格式：${VIDEO_ACCEPT_MINI_TYPE.join(", ")}`,
        [VIDEO_ACCEPT_MINI_TYPE.join(", ")],
      ),
    };
  }
  if (file.size > FILE_SIZE_LIMITS.VIDEO) {
    return {
      type: "VALIDATION_FAILED",
      message: $t(
        "global-1688-ai-app.InputChat.fileSelector.vFamn",
        `视频文件大小不能超过${FILE_SIZE_LIMITS_MB.VIDEO}MB`,
        [FILE_SIZE_LIMITS_MB.VIDEO],
      ),
    };
  }
  return true;
};

// 通用：校验图片或视频文件（导出供拖拽等场景复用）
export const validateImageOrVideoFile = (
  file: File,
): boolean | FileSelectorError => {
  const isImage = isImageMimeType(file.type);
  const isVideo = isVideoMimeType(file.type);

  if (!isImage && !isVideo) {
    return {
      type: "VALIDATION_FAILED",
      message: $t(
        "global-1688-ai-app.InputChat.fileSelector.jolmso.2",
        `仅支持上传图片${IMAGE_ACCEPT_MINI_TYPE.join(
          "、",
        )}格式；视频${VIDEO_ACCEPT_MINI_TYPE.join("、")}格式`,
        [IMAGE_ACCEPT_MINI_TYPE.join("、"), VIDEO_ACCEPT_MINI_TYPE.join("、")],
      ),
    };
  }

  if (isImage && file.size > FILE_SIZE_LIMITS.IMAGE) {
    return {
      type: "VALIDATION_FAILED",
      message: $t(
        "global-1688-ai-app.InputChat.fileSelector.iFamn",
        `图片文件大小不能超过${FILE_SIZE_LIMITS_MB.IMAGE}MB`,
        [FILE_SIZE_LIMITS_MB.IMAGE],
      ),
    };
  }

  if (isVideo && file.size > FILE_SIZE_LIMITS.VIDEO) {
    return {
      type: "VALIDATION_FAILED",
      message: $t(
        "global-1688-ai-app.InputChat.fileSelector.vFamn",
        `视频文件大小不能超过${FILE_SIZE_LIMITS_MB.VIDEO}MB`,
        [FILE_SIZE_LIMITS_MB.VIDEO],
      ),
    };
  }

  return true;
};

// 选择单张图片
export const selectImage = (
  options: Omit<FileSelectorOptions, "accept" | "multiple" | "validator"> & {
    validator?: (file: File) => boolean | FileSelectorError;
  } = {},
): Promise<File> => {
  return selectFiles({
    accept: imageAcceptString(),
    multiple: false,
    validator: validateImage,
    ...options,
  }) as Promise<File>;
};

// 选择单个视频
export const selectVideo = (
  options: Omit<FileSelectorOptions, "accept" | "multiple" | "validator"> & {
    validator?: (file: File) => boolean | FileSelectorError;
  } = {},
): Promise<File> => {
  return selectFiles({
    accept: videoAcceptString(),
    multiple: false,
    validator: validateVideo,
    ...options,
  }) as Promise<File>;
};

// 选择多张图片
export const selectMultipleImages = (
  options: Omit<FileSelectorOptions, "accept" | "multiple" | "validator"> & {
    validator?: (file: File) => boolean | FileSelectorError;
    instance?: FileSelector;
  } = {},
): Promise<File[]> => {
  return selectFiles({
    accept: imageAcceptString(),
    multiple: true,
    validator: validateImage,
    ...options,
  }) as Promise<File[]>;
};

// 选择多个视频
export const selectMultipleVideos = (
  options: Omit<FileSelectorOptions, "accept" | "multiple" | "validator"> & {
    validator?: (file: File) => boolean | FileSelectorError;
    instance?: FileSelector;
  } = {},
): Promise<File[]> => {
  return selectFiles({
    accept: videoAcceptString(),
    multiple: true,
    validator: validateVideo,
    ...options,
  }) as Promise<File[]>;
};

// 选择多个任意文件
export const selectAnyFiles = (
  options: FileSelectorOptions = {},
): Promise<File[]> => {
  return selectFiles({
    accept: "*/*",
    multiple: true,
    ...options,
  }) as Promise<File[]>;
};

// 选择单个任意文件
export const selectSingleFile = (
  options: FileSelectorOptions = {},
): Promise<File> => {
  return selectFiles({
    accept: "*/*",
    multiple: false,
    ...options,
  }) as Promise<File>;
};

// 选择单个图片或视频
export const selectImageOrVideo = (
  options: Omit<FileSelectorOptions, "accept" | "multiple" | "validator"> = {},
): Promise<File> => {
  return selectFiles({
    accept: imagesAndVideosAcceptString(),
    multiple: false,
    validator: validateImageOrVideoFile,
    ...options,
  }) as Promise<File>;
};

// 选择多个图片或视频
export const selectMultipleImagesOrVideos = (
  options: Omit<FileSelectorOptions, "accept" | "multiple" | "validator"> = {},
): Promise<File[]> => {
  return selectFiles({
    accept: imagesAndVideosAcceptString(),
    multiple: true,
    validator: validateImageOrVideoFile,
    ...options,
  }) as Promise<File[]>;
};

// 从 File 生成 TypeFileItem，用于拖拽/自定义场景的统一工具函数
export const createTypeFileItem = async (file: File): Promise<TypeFileItem> => {
  const id = uuidv4();
  const mime = file.type || "";
  const base: TypeFileItem = {
    id,
    file,
    state: TypeFileState.ready,
    progress: 100,
    type: detectMediaType(mime),
  };

  if (isImageMimeType(mime)) {
    try {
      const { width, height } = await getImageDimensions(file);
      return {
        ...base,
        width,
        height,
      };
    } catch (error) {
      // 获取尺寸失败时返回基础信息
      return base;
    }
  }

  return base;
};

// 批量：从 File[] 生成 TypeFileItem[]
export const createTypeFileItems = async (
  files: File[],
): Promise<TypeFileItem[]> => {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map(createTypeFileItem));
};

/**
 * 对外导出：在拖拽等自定义文件来源时，复用文件选择器的进度逻辑
 * 目的：让指定实例的loading状态在拖拽流程中也能工作
 */
export const simulateProgressForFiles = async (
  files: File[],
  instance: FileSelector,
): Promise<void> => {
  if (!files || files.length === 0) return;

  // 与 selectFiles 内部流程保持一致：重置 -> selecting(true) -> 初始化 -> 批量进度 -> 清理 -> selecting(false)
  (instance as any).prepareForNewSelection();
  instance.setSelecting(true);

  try {
    instance.initFileItems(files);
    const fileItems = instance.getFileItems();
    await simulateBatchFileProgress(
      fileItems,
      TypeFileState.uploading,
      TypeFileState.ready,
      instance,
    );
  } finally {
    // 完成后结束 selecting 状态，但保留文件项，供 UI 读取展示
    instance.setSelecting(false);
  }
};

// 校验图片尺寸和大小是否符合要求
export const validateImageDimensions = (
  width: number,
  height: number,
  fileSize: number,
): boolean => {
  const dimensionValid =
    width >= IMAGE_DIMENSION_LIMITS.MIN &&
    width <= IMAGE_DIMENSION_LIMITS.MAX &&
    height >= IMAGE_DIMENSION_LIMITS.MIN &&
    height <= IMAGE_DIMENSION_LIMITS.MAX;

  return dimensionValid && fileSize <= FILE_SIZE_LIMITS.IMAGE;
};

// 获取图片尺寸校验错误提示文案
export const getImageDimensionErrorMessage = (): string => {
  return $t(
    "global-1688-ai-app.InputChat.fileSelector.imageDimensionError",
    `图片尺寸超过处理限制,尺寸长和宽需大于${IMAGE_DIMENSION_LIMITS.MIN}px,且小于${IMAGE_DIMENSION_LIMITS.MAX}px,文件大小<${FILE_SIZE_LIMITS_MB.IMAGE}MB`,
    [
      IMAGE_DIMENSION_LIMITS.MIN,
      IMAGE_DIMENSION_LIMITS.MAX,
      FILE_SIZE_LIMITS_MB.IMAGE,
    ],
  );
};

// 从 url 创建图片文件项
export const createImageItemFromUrl = (item: TypeImageFromUrl) => {
  const { url, width, height } = item;
  const id = uuidv4();
  return {
    id,
    state: TypeFileState.ready,
    imagePreviewUrl: url,
    progress: 100,
    type: IMAGE,
    width: width || 0,
    height: height || 0,
  };
};

// 获取图片尺寸
export const getImageDimensions = (
  source: File | string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl: string | null = null;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    const handleLoad = () => {
      cleanup();
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Failed to load image dimensions"));
    };

    img.onload = handleLoad;
    img.onerror = handleError;

    if (source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else if (typeof source === "string") {
      if (!source) {
        resolve({ width: 0, height: 0 });
        return;
      }
      img.src = source;
    }
  });
};
