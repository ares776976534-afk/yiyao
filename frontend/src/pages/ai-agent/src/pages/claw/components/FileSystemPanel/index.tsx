import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message, Modal, Tooltip, Dropdown, Tree, Input } from 'antd';
import type { MenuProps, TreeDataNode, TreeProps } from 'antd';
import FilePreview from './FilePreview';
import DustbinIcon from '@/components/Icons/DustbinIcon';
import { queryFileContentByUrl } from './mock';
import {
  buildManagerContentUrl,
  deleteFileManagerItem,
  fetchFileManagerDirectory,
  fetchFileManagerFileBlob,
  fetchFileManagerTextContent,
  fetchFileManagerTree,
  FILE_MANAGER_UPLOAD_MAX_BYTES,
  moveFileManagerItem,
  uploadFileManagerFile,
} from '@/services/claw/fileManagerApi';
import {
  getExtensionFromPath,
  inferPreviewKindFromExtension,
  languageHintFromExtension,
  resolvePreviewKindForBlobResource,
} from './previewKind';
import type {
  TypeFileContentPayload,
  TypeFilePreviewKind,
  TypeFileSystemNode,
  TypeFileTreeNodeMeta,
  TypeTreeNodeMenuHandlers,
} from './types';
import {
  findNodeByPath,
  getParentDirectoryPath,
  mergeSingleLevel,
  remapFullPathPrefixInTree,
  remapPathKeys,
  replaceDirChildrenAtPath,
  resolveTargetDirForTreeDrop,
  stripDeepDirChildren,
} from './fileTreeMerge';
import styles from './index.module.scss';

type TypeTreeLoadDataNode = Parameters<NonNullable<TreeProps['loadData']>>[0];

const CLOSE_ICON_URL = 'https://img.alicdn.com/imgextra/i4/O1CN01qJL1KV1qMLy53iYey_!!6000000005481-55-tps-16-16.svg';
const UPLOAD_ICON_URL = 'https://img.alicdn.com/imgextra/i3/O1CN01MaZzWY28NsMuN8US8_!!6000000007921-55-tps-16-16.svg';
const DOWNLOAD_ICON_URL = 'https://img.alicdn.com/imgextra/i4/O1CN01Ein9Rn1GvmR7kjWZ8_!!6000000000685-55-tps-16-16.svg';
const ARROW_RIGHT_ICON_URL = 'https://img.alicdn.com/imgextra/i4/O1CN01hGHkKK1VAo3FDolhS_!!6000000002613-55-tps-16-16.svg';
const FILE_ICON_URL = 'https://img.alicdn.com/imgextra/i3/O1CN01foCYUm1nF4pPxRvPC_!!6000000005059-55-tps-16-16.svg';
const REFRESH_ICON_URL = 'https://img.alicdn.com/imgextra/i4/6000000007505/O1CN01JAKCGS25JLbG44juZ_!!6000000007505-2-gg_dtc.png';

interface TypeFileSystemPanelProps {
  onClose: () => void;
}

/** 路径是否深于工作区根（仅一段时视为根节点，不可重命名/删除） */
function treePathHasParentSegment(fullPath: string): boolean {
  return fullPath.split('/').filter(Boolean).length > 1;
}

function mapNodesToTreeData(
  nodes: TypeFileSystemNode[],
  handlers: TypeTreeNodeMenuHandlers,
): TreeDataNode[] {
  return nodes.map((node) => {
    const isFile = node.kind === 'file';
    const canDownload = isFile;

    const canRename = treePathHasParentSegment(node.fullPath);

    const menuItems: MenuProps['items'] = [
      {
        key: 'refresh',
        label: '刷新',
        icon: <i className={styles.treeActionMenuIcon} style={{ maskImage: `url(${REFRESH_ICON_URL})` }} />,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handlers.onRefreshDirectory(node.fullPath, isFile ? 'file' : 'dir');
        },
      },
      {
        key: 'download',
        label: '下载',
        icon: <i className={styles.treeActionMenuIcon} style={{ maskImage: `url(${DOWNLOAD_ICON_URL})` }} />,
        disabled: !canDownload,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          if (canDownload) {
            handlers.onDownload(node.fullPath);
          }
        },
      },
      // {
      //   key: 'rename',
      //   label: '重命名',
      //   disabled: !canRename,
      //   onClick: ({ domEvent }) => {
      //     domEvent.stopPropagation();
      //     if (canRename) {
      //       handlers.onRename(node.fullPath);
      //     }
      //   },
      // },
      {
        key: 'delete',
        danger: true,
        label: '删除',
        icon: <DustbinIcon className={styles.treeActionMenuIconSvg} aria-hidden />,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handlers.onDelete(node.fullPath);
        },
      },
    ].filter((item) => !item.disabled);

    return {
      key: node.fullPath,
      selectable: true,
      /** 目录始终非 leaf，空目录也保留箭头，便于折叠与视觉一致 */
      isLeaf: isFile,
      title: (
        <span className={styles.treeNodeTitle}>
          {isFile ? <img className={styles.treeFileIcon} src={FILE_ICON_URL} alt="" /> : null}
          <span className={styles.treeNodeText}>{node.name}</span>

          <Dropdown
            trigger={['hover']}
            placement="bottomLeft"
            overlayClassName={styles.treeNodeActionDropdown}
            menu={{ items: menuItems }}
          >
            <span
              className={styles.treeNodeActionTrigger}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <i className={styles.treeNodeActionIcon} />
            </span>
          </Dropdown>
        </span>
      ),
      children: isFile
        ? undefined
        : node.children === undefined
          ? undefined
          : node.children.length > 0
            ? mapNodesToTreeData(node.children, handlers)
            : [],
    };
  });
}

function buildNodeMetaByFullPath(
  nodes: TypeFileSystemNode[],
  acc: Map<string, TypeFileTreeNodeMeta> = new Map(),
): Map<string, TypeFileTreeNodeMeta> {
  nodes.forEach((node) => {
    acc.set(node.fullPath, {
      fullPath: node.fullPath,
      contentUrl: node.contentUrl,
      kind: node.kind,
    });
    if (node.kind === 'dir' && node.children?.length) {
      buildNodeMetaByFullPath(node.children, acc);
    }
  });
  return acc;
}

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match =
    /filename\*=UTF-8''([^;\n]+)|filename\*=([^;\n]+)|filename="([^"]+)"|filename=([^;\n]+)/i.exec(
      header,
    );
  if (!match) return null;
  const raw = (match[1] || match[2] || match[3] || match[4] || '').trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.replace(/^"|"$/g, ''));
  } catch {
    return raw.replace(/^"|"$/g, '');
  }
}

function sanitizeDownloadFileName(name: string): string {
  const cleaned = name.replace(/[/\\?*:|"<>]/g, '_').trim();
  return cleaned || 'download';
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const safeName = sanitizeDownloadFileName(fileName);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = safeName;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

const TEXT_PREVIEW_KINDS: TypeFilePreviewKind[] = ['plainText', 'code', 'markdown'];

// 目录树默认宽度
const TREE_PANE_DEFAULT_WIDTH_PX = 240;
// 目录树最小宽度
const TREE_PANE_MIN_WIDTH_PX = 240;

// 预览区域最小宽度
const PREVIEW_PANE_MIN_WIDTH_PX = 300;
// 分割线宽度
const SPLITTER_WIDTH_PX = 4;

function getBodyFlexInnerWidthPx(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  const paddingLeft = parseFloat(cs.paddingLeft) || 0;
  const paddingRight = parseFloat(cs.paddingRight) || 0;
  return el.clientWidth - paddingLeft - paddingRight;
}

function buildBinaryFallbackPayload(
  apiContentUrl: string,
  language: string | undefined,
): TypeFileContentPayload {
  return {
    url: apiContentUrl,
    content: '',
    previewKind: 'binary',
    language,
  };
}

async function buildWorkspacePreviewFromManager(
  managerFullPath: string,
  displayFullPath: string,
): Promise<TypeFileContentPayload> {
  const fileName = displayFullPath.split('/').filter(Boolean).pop() || managerFullPath;
  const ext = getExtensionFromPath(fileName);
  const previewKind = inferPreviewKindFromExtension(ext);
  const language = languageHintFromExtension(ext);
  const apiContentUrl = buildManagerContentUrl(managerFullPath);

  if (TEXT_PREVIEW_KINDS.includes(previewKind)) {
    try {
      const { content } = await fetchFileManagerTextContent(managerFullPath);
      const mimeType =
        previewKind === 'markdown'
          ? 'text/markdown'
          : ext === '.json'
            ? 'application/json'
            : 'text/plain';
      return {
        url: apiContentUrl,
        content,
        previewKind,
        language,
        mimeType,
      };
    } catch {
      return buildBinaryFallbackPayload(apiContentUrl, language);
    }
  }

  try {
    const { blob, mimeType } = await fetchFileManagerFileBlob(managerFullPath);
    const objectUrl = URL.createObjectURL(blob);
    const resolvedKind = resolvePreviewKindForBlobResource(previewKind, mimeType);
    return {
      url: objectUrl,
      content: '',
      previewKind: resolvedKind,
      language,
      mimeType,
    };
  } catch {
    if (ext === '.svg') {
      try {
        const { content } = await fetchFileManagerTextContent(managerFullPath);
        const svgBlob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
        const objectUrl = URL.createObjectURL(svgBlob);
        return {
          url: objectUrl,
          content: '',
          previewKind: 'image',
          language,
          mimeType: 'image/svg+xml',
        };
      } catch {
        /* 走下方通用占位 */
      }
    }
    return buildBinaryFallbackPayload(apiContentUrl, language);
  }
}

/**
 * 树组件不渲染工作区根节点，第一层即根的子项，无需再展开「虚拟根」。
 * 子目录仍由用户展开并按 directory 接口加载。
 */
function collectDefaultExpandedKeys(): React.Key[] {
  return [];
}

const FileSystemPanel: React.FC<TypeFileSystemPanelProps> = ({ onClose }) => {
  const [treeData, setTreeData] = useState<TypeFileSystemNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [activeFullPath, setActiveFullPath] = useState<string>('');
  const [activeFileData, setActiveFileData] = useState<TypeFileContentPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treePaneWidthPx, setTreePaneWidthPx] = useState(TREE_PANE_DEFAULT_WIDTH_PX);
  const [renameModal, setRenameModal] = useState<{
    open: boolean;
    sourceFullPath: string;
    name: string;
  }>({ open: false, sourceFullPath: '', name: '' });
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitterDragRef = useRef<{ startClientX: number; startWidthPx: number } | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const treeDataRef = useRef<TypeFileSystemNode[]>([]);

  const replaceActiveFileData = useCallback((next: TypeFileContentPayload | null) => {
    if (previewBlobUrlRef.current && previewBlobUrlRef.current !== next?.url) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }
    if (next?.url?.startsWith('blob:')) {
      previewBlobUrlRef.current = next.url;
    }
    setActiveFileData(next);
  }, []);

  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    treeDataRef.current = treeData;
  }, [treeData]);

  const refreshDirectoryLayer = useCallback(async (dirPath: string) => {
    if (!dirPath) {
      return;
    }
    try {
      const fetched = await fetchFileManagerDirectory(dirPath);
      setTreeData((prev) => {
        const existing = findNodeByPath(prev, dirPath);
        const merged = mergeSingleLevel(
          existing?.kind === 'dir' ? existing.children : undefined,
          fetched,
        );
        return replaceDirChildrenAtPath(prev, dirPath, merged);
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '刷新目录失败');
    }
  }, []);

  const handleLoadTreeData = useCallback(async (treeNode: TypeTreeLoadDataNode) => {
    const path = String(treeNode.key);
    const snapshot = findNodeByPath(treeDataRef.current, path);
    if (snapshot?.kind === 'dir' && snapshot.children !== undefined) {
      return;
    }
    try {
      const fetched = await fetchFileManagerDirectory(path);
      setTreeData((prev) => {
        const existing = findNodeByPath(prev, path);
        const merged = mergeSingleLevel(
          existing?.kind === 'dir' ? existing.children : undefined,
          fetched,
        );
        return replaceDirChildrenAtPath(prev, path, merged);
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载子目录失败');
    }
  }, []);

  const loadTree = useCallback((): Promise<void> => {
    setTreeLoading(true);
    return fetchFileManagerTree()
      .then((data) => {
        const lazyRoots = stripDeepDirChildren(data);
        setTreeData(lazyRoots);
        setExpandedKeys(collectDefaultExpandedKeys());
      })
      .catch((err) => {
        message.error(err instanceof Error ? err.message : '获取目录树失败');
      })
      .finally(() => {
        setTreeLoading(false);
      });
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    const bodyEl = bodyRef.current;
    if (!bodyEl || treeLoading) return;

    const clampTreeWidthToBody = () => {
      const innerW = getBodyFlexInnerWidthPx(bodyEl);
      const rawMax =
        innerW - SPLITTER_WIDTH_PX - PREVIEW_PANE_MIN_WIDTH_PX;
      const maxTreePx = Math.max(TREE_PANE_MIN_WIDTH_PX, rawMax);
      setTreePaneWidthPx((w) => Math.min(w, maxTreePx));
    };

    clampTreeWidthToBody();
    const ro = new ResizeObserver(() => {
      clampTreeWidthToBody();
    });
    ro.observe(bodyEl);
    return () => {
      ro.disconnect();
    };
  }, [treeLoading]);

  const nodeMetaByFullPath = useMemo(() => buildNodeMetaByFullPath(treeData), [treeData]);

  /** 目录树顶层工作区根节点的完整路径（与接口 filePath 一致，含首段） */
  const workspaceRootFullPath = useMemo(() => {
    const first = treeData[0];
    return first?.kind === 'dir' ? first.fullPath : '';
  }, [treeData]);

  const handleRefreshDirectoryAction = useCallback(
    (nodeFullPath: string, kind: TypeFileSystemNode['kind']) => {
      if (kind === 'dir') {
        void refreshDirectoryLayer(nodeFullPath);
        return;
      }
      const parent = getParentDirectoryPath(nodeFullPath) || workspaceRootFullPath;
      if (parent) {
        void refreshDirectoryLayer(parent);
      }
    },
    [refreshDirectoryLayer, workspaceRootFullPath],
  );

  const allowTreeDrop = useCallback<NonNullable<TreeProps['allowDrop']>>(
    ({ dragNode, dropNode, dropPosition }) => {
      const src = String(dragNode.key);
      if (!treePathHasParentSegment(src)) {
        return false;
      }
      const dropKey = String(dropNode.key);
      const dropToGap = dropPosition !== 0;
      const dropIsDir = nodeMetaByFullPath.get(dropKey)?.kind === 'dir';
      const targetDir = resolveTargetDirForTreeDrop(
        dropKey,
        dropToGap,
        Boolean(dropIsDir),
        workspaceRootFullPath,
      );
      const base = src.split('/').filter(Boolean).pop() ?? '';
      const targetFullPath = `${targetDir}/${base}`;
      if (targetFullPath === src) {
        return false;
      }
      const srcMeta = nodeMetaByFullPath.get(src);
      if (srcMeta?.kind === 'dir') {
        if (targetDir === src || targetDir.startsWith(`${src}/`)) {
          return false;
        }
      }
      return true;
    },
    [nodeMetaByFullPath, workspaceRootFullPath],
  );

  const handleTreeDrop = useCallback(
    async (info: Parameters<NonNullable<TreeProps['onDrop']>>[0]) => {
      info.event.preventDefault();
      const sourcePath = String(info.dragNodesKeys[0] ?? info.dragNode.key);
      if (!treePathHasParentSegment(sourcePath)) {
        return;
      }
      const dropKey = String(info.node.key);
      const dropToGap = info.dropToGap;
      const dropIsDir = nodeMetaByFullPath.get(dropKey)?.kind === 'dir';
      const targetDir = resolveTargetDirForTreeDrop(
        dropKey,
        dropToGap,
        Boolean(dropIsDir),
        workspaceRootFullPath,
      );
      const base = sourcePath.split('/').filter(Boolean).pop() ?? '';
      const targetFullPath = `${targetDir}/${base}`;

      if (targetFullPath === sourcePath) {
        return;
      }
      const srcMeta = nodeMetaByFullPath.get(sourcePath);
      if (srcMeta?.kind === 'dir') {
        if (targetDir === sourcePath || targetDir.startsWith(`${sourcePath}/`)) {
          message.warning('不能移动到自身或其子目录内');
          return;
        }
      }

      const prevActive = activeFullPath;
      const hadFilePreview = Boolean(activeFileData);
      const previewAffected =
        prevActive === sourcePath || prevActive.startsWith(`${sourcePath}/`);

      setLoading(true);
      try {
        await moveFileManagerItem(sourcePath, targetFullPath);
        setExpandedKeys((keys) => {
          const next = remapPathKeys(keys, sourcePath, targetFullPath);
          const set = new Set(next.map(String));
          set.add(targetDir);
          return [...set];
        });
        setSelectedKeys((keys) => remapPathKeys(keys, sourcePath, targetFullPath));
        setActiveFullPath((p) => {
          if (p === sourcePath) {
            return targetFullPath;
          }
          const slash = `${sourcePath}/`;
          if (p.startsWith(slash)) {
            return `${targetFullPath}/${p.slice(slash.length)}`;
          }
          return p;
        });
        const parentOld = getParentDirectoryPath(sourcePath) || workspaceRootFullPath;
        const parentNew = getParentDirectoryPath(targetFullPath) || workspaceRootFullPath;
        const parents = [...new Set([parentOld, parentNew].filter(Boolean))];
        await Promise.all(parents.map((p) => refreshDirectoryLayer(p)));
        if (hadFilePreview && previewAffected) {
          const nextActive =
            prevActive === sourcePath
              ? targetFullPath
              : `${targetFullPath}/${prevActive.slice(sourcePath.length + 1)}`;
          try {
            const payload = await buildWorkspacePreviewFromManager(nextActive, nextActive);
            replaceActiveFileData(payload);
          } catch {
            /* 路径已更新，预览可稍后重试 */
          }
        }
        message.success('已移动');
      } catch (err) {
        message.error(err instanceof Error ? err.message : '移动失败');
      } finally {
        setLoading(false);
      }
    },
    [
      activeFileData,
      activeFullPath,
      nodeMetaByFullPath,
      refreshDirectoryLayer,
      replaceActiveFileData,
      workspaceRootFullPath,
    ],
  );

  const runDownloadWithPayload = useCallback(
    async (fileData: TypeFileContentPayload, baseName: string) => {
      const { url, content, previewKind } = fileData;
      const safeBase = sanitizeDownloadFileName(baseName || 'download');
      const textKinds: TypeFilePreviewKind[] = ['plainText', 'code', 'markdown'];

      try {
        if (textKinds.includes(previewKind) && content.length > 0) {
          const mime =
            previewKind === 'markdown' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
          const blob = new Blob([content], { type: mime });
          triggerBlobDownload(blob, safeBase);
          return;
        }

        if (!/^https?:\/\//i.test(url)) {
          message.error('无法下载该文件（非网络地址且无可用文本内容）');
          return;
        }

        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
          throw new Error('bad status');
        }
        const blob = await response.blob();
        const fromHeader = parseFilenameFromContentDisposition(
          response.headers.get('Content-Disposition'),
        );
        const downloadName = fromHeader ? sanitizeDownloadFileName(fromHeader) : safeBase;
        triggerBlobDownload(blob, downloadName);
      } catch {
        if (/^https?:\/\//i.test(url)) {
          window.open(url, '_blank', 'noopener,noreferrer');
          message.info('受跨域或响应头限制无法直接保存，已在新窗口打开，请使用浏览器「另存为」保存');
        } else {
          message.error('下载失败');
        }
      }
    },
    [],
  );

  const handleTreeNodeDownload = useCallback(
    async (nodeFullPath: string) => {
      const meta = nodeMetaByFullPath.get(nodeFullPath);
      if (!meta || meta.kind !== 'file') {
        message.warning('该节点无法下载');
        return;
      }
      const baseName =
        meta.fullPath.split('/').filter(Boolean).pop() || meta.fullPath;
      if (meta.contentUrl) {
        setLoading(true);
        try {
          const fileData = await queryFileContentByUrl(meta.contentUrl);
          await runDownloadWithPayload(fileData, baseName);
        } catch (err) {
          message.error(err instanceof Error ? err.message : '下载失败');
        } finally {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const { blob } = await fetchFileManagerFileBlob(meta.fullPath);
        triggerBlobDownload(blob, baseName);
      } catch (err) {
        message.error(err instanceof Error ? err.message : '下载失败');
      } finally {
        setLoading(false);
      }
    },
    [nodeMetaByFullPath, runDownloadWithPayload],
  );

  const handleTreeNodeDelete = useCallback(
    (nodeFullPath: string) => {
      const meta = nodeMetaByFullPath.get(nodeFullPath);
      const displayName =
        meta?.fullPath.split('/').filter(Boolean).pop() || meta?.fullPath || '该项';
      if (!treePathHasParentSegment(nodeFullPath)) {
        message.warning('无法删除根目录');
        return;
      }
      Modal.confirm({
        title: '确定删除？',
        content: `删除后不可恢复，确定要删除「${displayName}」吗？`,
        okText: '删除',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: async () => {
          const underDeleted =
            meta &&
            activeFullPath &&
            (activeFullPath === meta.fullPath ||
              activeFullPath.startsWith(`${meta.fullPath}/`));
          const activeKey = selectedKeys.length > 0 ? String(selectedKeys[0]) : '';
          try {
            await deleteFileManagerItem(nodeFullPath, {
              recursive: meta?.kind === 'dir',
            });
            if (activeKey === nodeFullPath || underDeleted) {
              setSelectedKeys([]);
              setActiveFullPath('');
              replaceActiveFileData(null);
            }
            setExpandedKeys((keys) =>
              keys.filter((key) => {
                const s = String(key);
                return s !== nodeFullPath && !s.startsWith(`${nodeFullPath}/`);
              }),
            );
            const parentPath = getParentDirectoryPath(nodeFullPath);
            const rootPath = treeDataRef.current[0]?.fullPath ?? '';
            await refreshDirectoryLayer(parentPath || rootPath);
            message.success('已删除');
          } catch (err) {
            message.error(err instanceof Error ? err.message : '删除失败');
            throw err;
          }
        },
      });
    },
    [
      nodeMetaByFullPath,
      selectedKeys,
      activeFullPath,
      replaceActiveFileData,
      refreshDirectoryLayer,
    ],
  );

  const handleTreeNodeRenameOpen = useCallback((nodeFullPath: string) => {
    const segments = nodeFullPath.split('/').filter(Boolean);
    setRenameModal({
      open: true,
      sourceFullPath: nodeFullPath,
      name: segments[segments.length - 1] || '',
    });
  }, []);

  /**
   * 上传用的 filePath（完整路径，与接口约定一致）。
   * - 未选中、或选中项无法解析：落在工作区根目录 → `{workspaceRoot}/{fileName}`
   * - 选中根目录：同上
   * - 选中子目录：→ `{dirFullPath}/{fileName}`
   * - 选中文件：→ `{父目录完整路径}/{fileName}`
   * 尚无目录树时无法得知根路径，返回空字符串交由服务端默认规则。
   */
  const resolveUploadFilePathForSelection = useCallback(
    (file: File, selectedFullPath: string | undefined): string => {
      const name = file.name;
      const root = workspaceRootFullPath;

      const underWorkspaceRoot = (): string => {
        return root ? `${root}/${name}` : '';
      };

      if (!selectedFullPath) {
        return underWorkspaceRoot();
      }

      const meta = nodeMetaByFullPath.get(selectedFullPath);
      if (!meta) {
        return underWorkspaceRoot();
      }

      if (meta.kind === 'dir') {
        return `${selectedFullPath}/${name}`;
      }

      if (meta.kind === 'file') {
        const segs = selectedFullPath.split('/').filter(Boolean);
        if (segs.length <= 1) {
          return underWorkspaceRoot();
        }
        const parentFullPath = segs.slice(0, -1).join('/');
        return `${parentFullPath}/${name}`;
      }

      return underWorkspaceRoot();
    },
    [nodeMetaByFullPath, workspaceRootFullPath],
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (!files?.length) {
        return;
      }
      const selectedFullPath =
        selectedKeys.length > 0 ? String(selectedKeys[0]) : undefined;
      void (async () => {
        let okCount = 0;
        const rootPath = treeDataRef.current[0]?.fullPath ?? '';
        const parents = new Set<string>();
        for (const file of Array.from(files)) {
          if (file.size > FILE_MANAGER_UPLOAD_MAX_BYTES) {
            message.error(`「${file.name}」超过 10MB 上限`);
            continue;
          }
          const targetPath = resolveUploadFilePathForSelection(file, selectedFullPath);
          const fd = new FormData();
          fd.append('file', file);
          fd.append('filePath', targetPath);
          try {
            await uploadFileManagerFile(fd);
            okCount += 1;
            if (targetPath) {
              const par = getParentDirectoryPath(targetPath) || rootPath;
              if (par) {
                parents.add(par);
              }
            }
          } catch (err) {
            message.error(err instanceof Error ? err.message : '上传失败');
          }
        }
        event.target.value = '';
        if (okCount > 0) {
          await Promise.all([...parents].map((p) => refreshDirectoryLayer(p)));
          message.success(okCount > 1 ? `已上传 ${okCount} 个文件` : '上传成功');
        }
      })();
    },
    [refreshDirectoryLayer, resolveUploadFilePathForSelection, selectedKeys],
  );

  const handleHeaderUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const treeMenuHandlers = useMemo<TypeTreeNodeMenuHandlers>(
    () => ({
      onDownload: (nodeFullPath) => {
        void handleTreeNodeDownload(nodeFullPath);
      },
      onDelete: handleTreeNodeDelete,
      onRename: handleTreeNodeRenameOpen,
      onRefreshDirectory: handleRefreshDirectoryAction,
    }),
    [
      handleRefreshDirectoryAction,
      handleTreeNodeDelete,
      handleTreeNodeDownload,
      handleTreeNodeRenameOpen,
    ],
  );

  /** 菜单与接口仍用完整 treeData（含工作区根）；展示时从根的子节点起挂到 Tree，便于在组件根下拖拽到工作区根目录 */
  const antdTreeData = useMemo(() => {
    const root = treeData[0];
    if (root?.kind === 'dir') {
      return mapNodesToTreeData(root.children ?? [], treeMenuHandlers);
    }
    return mapNodesToTreeData(treeData, treeMenuHandlers);
  }, [treeData, treeMenuHandlers]);

  const handleOpenFileByFullPath = useCallback(
    async (fileFullPathKey: string) => {
      const meta = nodeMetaByFullPath.get(fileFullPathKey);
      if (!meta || meta.kind !== 'file') {
        message.warning('无法预览该文件');
        return;
      }
      setLoading(true);
      setActiveFullPath(meta.fullPath);
      setSelectedKeys([fileFullPathKey]);
      try {
        if (meta.contentUrl) {
          const fileData = await queryFileContentByUrl(meta.contentUrl);
          replaceActiveFileData(fileData);
        } else {
          const payload = await buildWorkspacePreviewFromManager(
            meta.fullPath,
            meta.fullPath,
          );
          replaceActiveFileData(payload);
        }
      } catch (err) {
        message.error(err instanceof Error ? err.message : '加载失败');
        replaceActiveFileData(null);
        setSelectedKeys([]);
      } finally {
        setLoading(false);
      }
    },
    [nodeMetaByFullPath, replaceActiveFileData],
  );

  const handleRenameModalOk = useCallback(async () => {
    const { sourceFullPath, name } = renameModal;
    const trimmed = name.trim();
    if (!trimmed) {
      message.warning('请输入名称');
      return;
    }
    if (!treePathHasParentSegment(sourceFullPath)) {
      message.warning('无法重命名');
      return;
    }
    const leadingSlash = sourceFullPath.startsWith('/') ? '/' : '';
    const segments = sourceFullPath.split('/').filter(Boolean);
    segments[segments.length - 1] = trimmed;
    const targetFullPath = `${leadingSlash}${segments.join('/')}`;
    if (targetFullPath === sourceFullPath) {
      setRenameModal({ open: false, sourceFullPath: '', name: '' });
      return;
    }
    setLoading(true);
    try {
      await moveFileManagerItem(sourceFullPath, targetFullPath);
      const previewAffected =
        activeFullPath === sourceFullPath ||
        activeFullPath.startsWith(`${sourceFullPath}/`);
      const nextActive =
        activeFullPath === sourceFullPath
          ? targetFullPath
          : activeFullPath.startsWith(`${sourceFullPath}/`)
            ? `${targetFullPath}/${activeFullPath.slice(sourceFullPath.length + 1)}`
            : activeFullPath;

      setTreeData((prev) => remapFullPathPrefixInTree(prev, sourceFullPath, targetFullPath));
      setExpandedKeys((keys) => remapPathKeys(keys, sourceFullPath, targetFullPath));
      setSelectedKeys((keys) => remapPathKeys(keys, sourceFullPath, targetFullPath));
      setActiveFullPath(nextActive);
      setRenameModal({ open: false, sourceFullPath: '', name: '' });

      const parentPath = getParentDirectoryPath(sourceFullPath) || workspaceRootFullPath;
      if (parentPath) {
        await refreshDirectoryLayer(parentPath);
      }

      if (activeFileData && previewAffected) {
        try {
          const payload = await buildWorkspacePreviewFromManager(nextActive, nextActive);
          replaceActiveFileData(payload);
        } catch (err) {
          message.error(err instanceof Error ? err.message : '加载预览失败');
          replaceActiveFileData(null);
        }
      } else if (previewAffected) {
        replaceActiveFileData(null);
      }
      message.success('已重命名');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '重命名失败');
    } finally {
      setLoading(false);
    }
  }, [
    renameModal,
    activeFullPath,
    activeFileData,
    replaceActiveFileData,
    refreshDirectoryLayer,
    workspaceRootFullPath,
  ]);

  const previewFileName = useMemo(() => {
    if (!activeFullPath) return '';
    const segments = activeFullPath.split('/');
    return segments[segments.length - 1] || activeFullPath;
  }, [activeFullPath]);

  const canCopyAsText = useMemo(() => {
    if (!activeFileData) return false;
    if (!['plainText', 'code', 'markdown'].includes(activeFileData.previewKind)) return false;
    return Boolean(activeFileData.content.trim());
  }, [activeFileData]);

  const handleCopyPreview = useCallback(async () => {
    if (!activeFileData) return;
    try {
      if (canCopyAsText) {
        await navigator.clipboard.writeText(activeFileData.content);
        message.success('已复制内容');
      } else if (activeFileData.url) {
        await navigator.clipboard.writeText(activeFileData.url);
        message.success('已复制链接');
      }
    } catch {
      message.error('复制失败');
    }
  }, [activeFileData, canCopyAsText]);

  const handleTreePreviewSplitterMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      const bodyEl = bodyRef.current;
      if (!bodyEl) return;
      splitterDragRef.current = {
        startClientX: event.clientX,
        startWidthPx: treePaneWidthPx,
      };

      const onMove = (ev: MouseEvent) => {
        const drag = splitterDragRef.current;
        if (!drag || !bodyEl) return;
        const innerW = getBodyFlexInnerWidthPx(bodyEl);
        const rawMaxTree =
          innerW - SPLITTER_WIDTH_PX - PREVIEW_PANE_MIN_WIDTH_PX;
        const maxTreePx = Math.max(TREE_PANE_MIN_WIDTH_PX, rawMaxTree);
        const delta = ev.clientX - drag.startClientX;
        const next = Math.min(
          maxTreePx,
          Math.max(TREE_PANE_MIN_WIDTH_PX, drag.startWidthPx + delta),
        );
        setTreePaneWidthPx(next);
      };

      const onUp = () => {
        splitterDragRef.current = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [treePaneWidthPx],
  );

  const handleDownloadFile = useCallback(async () => {
    if (!activeFileData) return;
    const meta = nodeMetaByFullPath.get(activeFullPath);
    if (meta?.kind === 'file') {
      if (meta.contentUrl) {
        setLoading(true);
        try {
          const fileData = await queryFileContentByUrl(meta.contentUrl);
          await runDownloadWithPayload(fileData, previewFileName || 'download');
        } catch (err) {
          message.error(err instanceof Error ? err.message : '下载失败');
        } finally {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const { blob } = await fetchFileManagerFileBlob(meta.fullPath);
        triggerBlobDownload(blob, previewFileName || 'download');
      } catch (err) {
        message.error(err instanceof Error ? err.message : '下载失败');
      } finally {
        setLoading(false);
      }
      return;
    }
    await runDownloadWithPayload(activeFileData, previewFileName || 'download');
  }, [
    activeFileData,
    activeFullPath,
    nodeMetaByFullPath,
    previewFileName,
    runDownloadWithPayload,
  ]);

  return (
    <div className={`${styles.panel} ${treeLoading ? styles.treeLoading : ''}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>所有文件</span>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.hiddenFileInput}
            multiple
            onChange={handleFileInputChange}
          />
          <button
            type="button"
            className={styles.headerIconBtn}
            onClick={handleHeaderUploadClick}
            aria-label="上传文件"
          >
            <img className={styles.headerIcon} src={UPLOAD_ICON_URL} alt="" />
          </button>
          <button type="button" className={styles.headerIconBtn} onClick={onClose} aria-label="关闭文件系统">
            <img className={styles.headerIcon} src={CLOSE_ICON_URL} alt="" />
          </button>
        </div>
        <div ref={bodyRef} className={styles.body}>
          <div
            className={styles.treePane}
            style={{ width: treePaneWidthPx }}
          >
            <Tree
              blockNode
              multiple={false}
              className={styles.fileTree}
              treeData={antdTreeData}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              draggable={{
                icon: false,
                nodeDraggable: (node) => treePathHasParentSegment(String(node.key)),
              }}
              allowDrop={allowTreeDrop}
              onDrop={(info) => void handleTreeDrop(info)}
              loadData={(node) => handleLoadTreeData(node)}
              expandAction="click"
              showIcon={false}
              switcherIcon={({ expanded, isLeaf }) => {
                if (isLeaf) {
                  return <span className={styles.treeSwitcherPlaceholder} />;
                }
                return (
                  <span className={styles.treeSwitcher}>
                    <img
                      className={`${styles.treeSwitcherIcon} ${expanded ? styles.treeSwitcherIconExpanded : ''}`}
                      src={ARROW_RIGHT_ICON_URL}
                      alt=""
                    />
                  </span>
                );
              }}
              onExpand={(keys) => setExpandedKeys(keys)}
              onSelect={(keys, info) => {
                if (!info.selected) {
                  setSelectedKeys([]);
                  return;
                }
                const nodeFullPath = String(keys[0] ?? info.node.key);
                setSelectedKeys([nodeFullPath]);
                const meta = nodeMetaByFullPath.get(nodeFullPath);
                if (meta?.kind === 'dir') {
                  return;
                }
                void handleOpenFileByFullPath(nodeFullPath);
              }}
            />
          </div>

          {!treeLoading ? (
            <div
              className={styles.treePreviewSplitter}
              style={{ width: SPLITTER_WIDTH_PX }}
              role="separator"
              aria-orientation="vertical"
              aria-label="调整目录与预览区域宽度"
              onMouseDown={handleTreePreviewSplitterMouseDown}
            />
          ) : null}

          <div className={styles.previewPane}>
            {activeFileData ? (
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <span className={styles.previewPath} title={activeFullPath}>
                    {previewFileName}
                  </span>
                  {/* <Tooltip title={canCopyAsText ? '复制内容' : '复制链接'} trigger="hover">
                    <button
                      type="button"
                      className={styles.previewToolBtn}
                      onClick={handleCopyPreview}
                      aria-label={canCopyAsText ? '复制文件内容' : '复制文件链接'}
                    >
                      <img className={styles.previewToolIcon} src={DOWNLOAD_ICON_URL} alt="" />
                    </button>
                  </Tooltip> */}
                  <Tooltip title="下载文件" trigger="hover">
                    <button
                      type="button"
                      className={styles.previewToolBtn}
                      onClick={() => void handleDownloadFile()}
                      aria-label="下载文件"
                    >
                      <img className={styles.previewToolIcon} src={DOWNLOAD_ICON_URL} alt="" />
                    </button>
                  </Tooltip>
                </div>
                <div className={styles.previewContent}>
                  <FilePreview payload={activeFileData} fileName={previewFileName} fullPath={activeFullPath} />
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <i className={styles.emptyStateIcon} />
                <div>
                  {treeLoading
                    ? '正在加载目录...'
                    : loading
                      ? '正在加载文件...'
                      : '请点击左侧文件进行预览'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="重命名"
        open={renameModal.open}
        okText="确定"
        cancelText="取消"
        onOk={() => void handleRenameModalOk()}
        onCancel={() => setRenameModal({ open: false, sourceFullPath: '', name: '' })}
        destroyOnClose
      >
        <Input
          value={renameModal.name}
          onChange={(e) =>
            setRenameModal((prev) => ({ ...prev, name: e.target.value }))
          }
          onPressEnter={() => void handleRenameModalOk()}
          placeholder="名称"
        />
      </Modal>
    </div>
  );
};

export default FileSystemPanel;
