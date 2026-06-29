/** AlphaClaw 文件管理 /alphaclaw/files 接口相关类型 */

export interface TypeApiTreeNode {
  name: string;
  /** 树内完整路径；HTTP 原始 JSON 可能为 path，会在解析时归一成 fullPath */
  fullPath: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedTime?: number;
  isWorkspaceRoot?: boolean;
  /** 可选：服务端或本地 mock 显式下发的预览地址（mock://、https 等）；目录树映射阶段不拼接 Alphaclaw 接口 URL */
  contentUrl?: string;
  children?: TypeApiTreeNode[];
}

export interface TypeApiFileContentInner {
  success: boolean;
  filePath?: string;
  content?: string;
  size?: number;
  error?: string;
}

/** 下载接口成功响应：Blob + 从 Content-Type（或 Blob.type）解析的主 MIME */
export interface TypeFileManagerDownloadResult {
  blob: Blob;
  mimeType: string;
}
