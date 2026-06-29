import { DEFAULT_LANG } from '@/i18n/constants';
import { materiaRequest as request } from '@/services/httpRequest';
import { materialBaseAPIUrl } from '@/utils/env';
import {
  delayFileManagerMock,
  mockFetchDirectoryChildren,
  mockFileManagerBodyByPath,
  mockFileManagerTreeData,
} from '@/services/mocks/fileManagerMock';
import type {
  TypeApiFileContentInner,
  TypeApiTreeNode,
  TypeFileManagerDownloadResult,
} from './fileManagerTypes';
import type { TypeFileSystemNode } from '@/pages/claw/components/FileSystemPanel/types';

/** 为 true 时使用 @/services/mocks/fileManagerMock 数据，不发真实请求；联调真实接口时改为 false */
export const USE_FILE_MANAGER_API_MOCK = false;

/** 将接口 JSON（path 等）归一为 TypeApiTreeNode；可选 contentUrl 仅在服务端显式下发时保留 */
function normalizeWireTreeNode(raw: unknown): TypeApiTreeNode {
  if (!raw || typeof raw !== 'object') {
    return { name: '', fullPath: '', type: 'file' };
  }
  const o = raw as Record<string, unknown>;
  const fullPath =
    typeof o.fullPath === 'string'
      ? o.fullPath
      : typeof o.path === 'string'
        ? o.path
        : '';
  const name = typeof o.name === 'string' ? o.name : '';
  const type: 'file' | 'directory' =
    o.type === 'file' || o.type === 'directory' ? o.type : 'file';
  const childrenRaw = o.children;
  const children = Array.isArray(childrenRaw)
    ? childrenRaw.map((c) => normalizeWireTreeNode(c))
    : undefined;
  const contentUrlFromWire =
    typeof o.contentUrl === 'string'
      ? o.contentUrl
      : typeof o.contentPath === 'string'
        ? o.contentPath
        : undefined;

  const node: TypeApiTreeNode = {
    name,
    fullPath,
    type,
    children,
  };
  if (typeof o.size === 'number') {
    node.size = o.size;
  }
  if (typeof o.modifiedTime === 'number') {
    node.modifiedTime = o.modifiedTime;
  }
  if (o.isWorkspaceRoot === true) {
    node.isWorkspaceRoot = true;
  }
  if (contentUrlFromWire) {
    node.contentUrl = contentUrlFromWire;
  }
  return node;
}

function normalizeWireTreeList(list: unknown[]): TypeApiTreeNode[] {
  return list.map((item) => normalizeWireTreeNode(item));
}

function pickTreePayload(res: unknown): TypeApiTreeNode[] | null {
  if (!res || typeof res !== 'object') {
    return null;
  }
  const o = res as Record<string, unknown>;
  if (o.success === true && Array.isArray(o.data)) {
    return normalizeWireTreeList(o.data);
  }
  if (Array.isArray(o.data)) {
    return normalizeWireTreeList(o.data);
  }
  if (Array.isArray(o.result)) {
    return normalizeWireTreeList(o.result);
  }
  return null;
}

export function buildManagerContentUrl(managerFullPath: string): string {
  return `${materialBaseAPIUrl}/alphaclaw/files/file/content?filePath=${encodeURIComponent(managerFullPath)}`;
}

function mapApiNode(node: TypeApiTreeNode): TypeFileSystemNode {
  const isDir = node.type === 'directory';
  const item: TypeFileSystemNode = {
    fullPath: node.fullPath,
    name: node.name,
    kind: isDir ? 'dir' : 'file',
  };
  if (!isDir && node.contentUrl) {
    item.contentUrl = node.contentUrl;
  }
  if (isDir) {
    item.children = (node.children ?? []).map(mapApiNode);
  }
  return item;
}

export function mapApiTreeToFileSystemNodes(nodes: TypeApiTreeNode[]): TypeFileSystemNode[] {
  return nodes.map(mapApiNode);
}

/** directory 接口一层子节点：目录不附带深层 children，由前端按需再拉 */
function mapApiNodeShallowDirectoryEntry(node: TypeApiTreeNode): TypeFileSystemNode {
  const isDir = node.type === 'directory';
  const item: TypeFileSystemNode = {
    fullPath: node.fullPath,
    name: node.name,
    kind: isDir ? 'dir' : 'file',
  };
  if (!isDir && node.contentUrl) {
    item.contentUrl = node.contentUrl;
  }
  if (isDir) {
    item.children = undefined;
  }
  return item;
}

/**
 * 读取指定目录下的直接子节点（非递归），用于按需展开与单层刷新。
 * 查询参数名与网关约定一致：dirPath。
 */
export async function fetchFileManagerDirectory(dirPath: string): Promise<TypeFileSystemNode[]> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    const raw = mockFetchDirectoryChildren(dirPath);
    return raw.map(mapApiNodeShallowDirectoryEntry);
  }

  const res = await request(
    `/alphaclaw/files/directory?dirPath=${encodeURIComponent(dirPath)}`,
    {
      method: 'GET',
    },
  );
  const list = pickTreePayload(res);
  if (!list) {
    const msg =
      typeof (res as Record<string, unknown>)?.retMsg === 'string'
        ? String((res as Record<string, unknown>).retMsg)
        : '获取目录列表失败';
    throw new Error(msg);
  }
  return list.map(mapApiNodeShallowDirectoryEntry);
}

export async function fetchFileManagerTree(): Promise<TypeFileSystemNode[]> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    return mapApiTreeToFileSystemNodes(mockFileManagerTreeData);
  }

  const res = await request('/alphaclaw/files/tree', {
    method: 'GET',
  });
  const list = pickTreePayload(res);
  if (!list) {
    const msg =
      typeof (res as Record<string, unknown>)?.retMsg === 'string'
        ? String((res as Record<string, unknown>).retMsg)
        : '获取目录树失败';
    throw new Error(msg);
  }
  return mapApiTreeToFileSystemNodes(list);
}

/** 将 UTF-8 字符串转为字节长度（与接口 size 语义一致） */
function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * 解析 GET /file/content 响应。
 * 约定形态：{ success, data: { success, content, size } }；
 * 部分服务端对 JSON 文件会直接返回解析后的对象（无 data.content 包装），此处一并兼容。
 */
function parseFileContentResponse(res: unknown): { content: string; size: number } {
  if (res === null || res === undefined) {
    throw new Error('获取文件内容失败');
  }
  if (typeof res === 'string') {
    return { content: res, size: utf8ByteLength(res) };
  }
  if (typeof res !== 'object') {
    throw new Error('获取文件内容失败');
  }

  const outer = res as Record<string, unknown>;

  if (outer.success === false) {
    throw new Error(
      typeof outer.retMsg === 'string' && outer.retMsg.trim()
        ? outer.retMsg
        : '获取文件内容失败',
    );
  }

  const dataRaw = outer.data;

  if (typeof dataRaw === 'string') {
    return { content: dataRaw, size: utf8ByteLength(dataRaw) };
  }

  if (dataRaw && typeof dataRaw === 'object') {
    const inner = dataRaw as TypeApiFileContentInner & Record<string, unknown>;
    if (typeof inner.success === 'boolean') {
      if (!inner.success) {
        throw new Error(
          typeof inner.error === 'string' && inner.error.trim()
            ? inner.error
            : '获取文件内容失败',
        );
      }
      const content = typeof inner.content === 'string' ? inner.content : '';
      const size =
        typeof inner.size === 'number' ? inner.size : utf8ByteLength(content);
      return { content, size };
    }
    const raw = JSON.stringify(dataRaw, null, 2);
    return { content: raw, size: utf8ByteLength(raw) };
  }

  if (outer.success === true && (dataRaw === undefined || dataRaw === null)) {
    throw new Error(
      typeof outer.retMsg === 'string' ? outer.retMsg : '获取文件内容失败',
    );
  }

  const raw = JSON.stringify(outer, null, 2);
  return { content: raw, size: utf8ByteLength(raw) };
}

export async function fetchFileManagerTextContent(
  apiFilePath: string,
): Promise<{ content: string; size: number }> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    const body = mockFileManagerBodyByPath[apiFilePath];
    if (!body) {
      throw new Error(`mock：未配置该路径的内容 ${apiFilePath}`);
    }
    return { content: body.content, size: body.size };
  }

  const res = await request(
    `/alphaclaw/files/file/content?filePath=${encodeURIComponent(apiFilePath)}`,
    {
      method: 'GET',
    },
  );
  return parseFileContentResponse(res);
}

/** 单文件上传大小上限（与接口约定一致） */
export const FILE_MANAGER_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

function assertMateriaApiSuccess(res: unknown, fallbackMsg: string): void {
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    if ('success' in o && o.success === false) {
      const msg =
        typeof o.retMsg === 'string' && o.retMsg.trim()
          ? o.retMsg
          : fallbackMsg;
      throw new Error(msg);
    }
  }
}

/**
 * 上传文件到工作区（multipart：file、filePath）
 * filePath 可为空字符串，表示由服务端按默认规则落盘（不要省略字段名，以便网关/服务端统一解析）
 * @returns 尽力从响应中解析的路径或 URL 片段，便于提示
 */
export async function uploadFileManagerFile(formData: FormData): Promise<string> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    return '';
  }

  const res = await request('/alphaclaw/files/file/upload', {
    method: 'POST',
    body: formData,
  });
  assertMateriaApiSuccess(res, '上传失败');
  return pickUploadResultHint(res);
}

function pickUploadResultHint(res: unknown): string {
  if (!res || typeof res !== 'object') {
    return '';
  }
  const o = res as Record<string, unknown>;
  if (typeof o.data === 'string' && o.data.trim()) {
    return o.data.trim();
  }
  if (o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>;
    if (typeof d.filePath === 'string' && d.filePath.trim()) {
      return d.filePath.trim();
    }
    if (typeof d.path === 'string' && d.path.trim()) {
      return d.path.trim();
    }
  }
  if (typeof o.result === 'string' && o.result.trim()) {
    return o.result.trim();
  }
  return '';
}

/** 删除文件或目录（目录可 recursive） */
export async function deleteFileManagerItem(
  apiFilePath: string,
  options?: { recursive?: boolean },
): Promise<void> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    return;
  }

  const qs = new URLSearchParams();
  qs.set('filePath', apiFilePath);
  if (options?.recursive) {
    qs.set('recursive', 'true');
  }

  const res = await request(`/alphaclaw/files/file/delete?${qs.toString()}`, {
    method: 'POST',
  });
  assertMateriaApiSuccess(res, '删除失败');
}

/** 移动 / 重命名（sourcePath、targetPath 均为接口相对路径） */
export async function moveFileManagerItem(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    return;
  }

  const body = new URLSearchParams({
    sourcePath,
    targetPath,
  });

  const res = await request('/alphaclaw/files/file/move', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  assertMateriaApiSuccess(res, '移动失败');
}

/** 从 Content-Type 头取主类型（小写、无 charset 等参数） */
function parsePrimaryMimeFromContentTypeHeader(header: string | null): string {
  if (!header || typeof header !== 'string') {
    return '';
  }
  const main = header.split(';')[0]?.trim().toLowerCase() ?? '';
  return main;
}

/**
 * 拉取下载接口为 Blob，并带回服务端声明的 MIME（便于预览选型）。
 * 不使用 materiaRequest：全局 parseResponse 对 image/svg+xml、image/png 等常按文本/JSON 解析，导致无法预览与「响应不是文件流」误判。
 */
export async function fetchFileManagerFileBlob(
  apiFilePath: string,
): Promise<TypeFileManagerDownloadResult> {
  if (USE_FILE_MANAGER_API_MOCK) {
    await delayFileManagerMock();
    const body = mockFileManagerBodyByPath[apiFilePath];
    if (!body) {
      throw new Error(`mock：未配置该路径的下载 ${apiFilePath}`);
    }
    const blob = new Blob([body.content], { type: 'application/octet-stream' });
    return { blob, mimeType: 'application/octet-stream' };
  }

  const url = `${materialBaseAPIUrl}/alphaclaw/files/file/download?filePath=${encodeURIComponent(apiFilePath)}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-I18n-Language': DEFAULT_LANG,
    },
  });

  if (!res.ok) {
    let msg = `下载失败（${res.status}）`;
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = (await res.json()) as Record<string, unknown>;
        if (typeof j.retMsg === 'string' && j.retMsg.trim()) {
          msg = j.retMsg.trim();
        } else if (typeof j.message === 'string' && j.message.trim()) {
          msg = j.message.trim();
        }
      } else {
        const t = await res.text();
        if (t.trim()) {
          msg = t.trim().slice(0, 200);
        }
      }
    } catch {
      /* 忽略解析错误，使用默认 msg */
    }
    throw new Error(msg);
  }

  const headerMime = parsePrimaryMimeFromContentTypeHeader(res.headers.get('content-type'));
  const blob = await res.blob();
  const blobMime = parsePrimaryMimeFromContentTypeHeader(blob.type || null);
  const mimeType = headerMime || blobMime || 'application/octet-stream';

  return { blob, mimeType };
}
