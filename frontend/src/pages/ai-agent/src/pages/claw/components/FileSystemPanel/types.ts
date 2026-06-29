export type TypeFileNodeKind = 'dir' | 'file';

/** 与 GitHub「文件查看器」类似：按类型选择渲染方式（后端也可直接下发） */
export type TypeFilePreviewKind =
  | 'plainText'
  | 'markdown'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'officeWord'
  | 'officeExcel'
  | 'archive'
  /** 数据库等二进制文件，不在预览区当文本渲染（类似 GitHub） */
  | 'binary'
  | 'unknown';

export interface TypeFileSystemNode {
  /** 树内唯一完整路径 */
  fullPath: string;
  name: string;
  kind: TypeFileNodeKind;
  /** 目录：undefined 表示尚未拉取子节点；[] 表示已加载且无子项 */
  children?: TypeFileSystemNode[];
  /**
   * 可选：外链/mock 预览地址（由服务端或 mock 树显式下发）；工作区文件预览与下载在行为触发时用 fullPath 调接口转换
   */
  contentUrl?: string;
}

/** 目录树节点元信息（用于菜单与接口路径） */
export interface TypeFileTreeNodeMeta {
  fullPath: string;
  contentUrl?: string;
  kind: TypeFileNodeKind;
}

export interface TypeTreeNodeMenuHandlers {
  onDownload: (nodeFullPath: string) => void;
  onDelete: (nodeFullPath: string) => void;
  onRename: (nodeFullPath: string) => void;
  /** 仅刷新该节点对应的一层列表（文件则刷新其父目录） */
  onRefreshDirectory: (nodeFullPath: string, kind: TypeFileNodeKind) => void;
}

export interface TypeFileContentPayload {
  /** 实际资源地址（文本类为同源/可拉取时的源；媒体/二进制为直链） */
  url: string;
  /** 文本/Markdown/代码内容；二进制类可为空 */
  content: string;
  previewKind: TypeFilePreviewKind;
  language?: string;
  /**
   * 资源真实 MIME 主类型（如 image/png）。
   * 走下载流预览时来自响应 Content-Type；纯文本 content 接口为 JSON 包装时通常无此项。
   */
  mimeType?: string;
}
