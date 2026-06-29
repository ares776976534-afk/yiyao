import type { Key } from 'react';

import type { TypeFileSystemNode } from './types';

/** 将整树接口返回结果压成「仅第一层已加载」，子目录 children 为 undefined，展开时再拉 directory 接口 */
export function stripDeepDirChildren(nodes: TypeFileSystemNode[]): TypeFileSystemNode[] {
  return nodes.map((node) => {
    if (node.kind === 'file') {
      return node;
    }
    const shallowKids = (node.children ?? []).map((child) =>
      child.kind === 'dir'
        ? {
            fullPath: child.fullPath,
            name: child.name,
            kind: 'dir' as const,
            children: undefined,
          }
        : child,
    );
    return { ...node, children: shallowKids };
  });
}

export function findNodeByPath(
  nodes: TypeFileSystemNode[],
  path: string,
): TypeFileSystemNode | null {
  for (const n of nodes) {
    if (n.fullPath === path) {
      return n;
    }
    if (n.kind === 'dir' && n.children?.length) {
      const found = findNodeByPath(n.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 用新的一层列表替换某目录的直接子节点，并按 fullPath 合并：已展开子树保留在内存中的 children。
 */
export function mergeSingleLevel(
  previousChildren: TypeFileSystemNode[] | undefined,
  nextChildren: TypeFileSystemNode[],
): TypeFileSystemNode[] {
  const prevMap = new Map((previousChildren ?? []).map((o) => [o.fullPath, o]));
  return nextChildren.map((next) => {
    const old = prevMap.get(next.fullPath);
    if (old?.kind === 'dir' && next.kind === 'dir' && old.children !== undefined) {
      return { ...next, children: old.children };
    }
    if (next.kind === 'dir') {
      return { ...next, children: undefined };
    }
    return next;
  });
}

export function replaceDirChildrenAtPath(
  roots: TypeFileSystemNode[],
  dirFullPath: string,
  newDirectChildren: TypeFileSystemNode[],
): TypeFileSystemNode[] {
  const walk = (list: TypeFileSystemNode[]): TypeFileSystemNode[] =>
    list.map((n) => {
      if (n.fullPath === dirFullPath && n.kind === 'dir') {
        return { ...n, children: newDirectChildren };
      }
      if (n.kind === 'dir' && n.children?.length) {
        return { ...n, children: walk(n.children) };
      }
      return n;
    });
  return walk(roots);
}

/** 重命名 / 移动后，把缓存树里匹配前缀的路径整体改键（含子节点） */
export function remapFullPathPrefixInTree(
  nodes: TypeFileSystemNode[],
  oldPrefix: string,
  newPrefix: string,
): TypeFileSystemNode[] {
  const remapOne = (p: string) => {
    if (p === oldPrefix) {
      return newPrefix;
    }
    const slash = `${oldPrefix}/`;
    if (p.startsWith(slash)) {
      return `${newPrefix}/${p.slice(slash.length)}`;
    }
    return p;
  };
  const walk = (list: TypeFileSystemNode[]): TypeFileSystemNode[] =>
    list.map((n) => {
      const fullPath = remapOne(n.fullPath);
      const name = fullPath.split('/').filter(Boolean).pop() ?? n.name;
      if (n.kind === 'dir') {
        if (n.children?.length) {
          return { ...n, fullPath, name, children: walk(n.children) };
        }
        return { ...n, fullPath, name, children: n.children };
      }
      return { ...n, fullPath, name };
    });
  return walk(nodes);
}

export function remapPathKeys(list: Key[], oldPrefix: string, newPrefix: string): Key[] {
  return list.map((k) => {
    const s = String(k);
    if (s === oldPrefix) {
      return newPrefix;
    }
    const slash = `${oldPrefix}/`;
    if (s.startsWith(slash)) {
      return `${newPrefix}/${s.slice(slash.length)}`;
    }
    return k;
  });
}

/** 父目录完整路径；仅一段时返回空串（表示无父级，刷新时用工作区根） */
export function getParentDirectoryPath(fullPath: string): string {
  const leading = fullPath.startsWith('/') ? '/' : '';
  const segs = fullPath.split('/').filter(Boolean);
  if (segs.length <= 1) {
    return '';
  }
  return `${leading}${segs.slice(0, -1).join('/')}`;
}

/**
 * 根据 rc-tree / antd Tree 的放置方式解析目标「父目录」路径（移动后文件落在该目录下，文件名不变）。
 */
export function resolveTargetDirForTreeDrop(
  dropKey: string,
  dropToGap: boolean,
  dropNodeIsDirectory: boolean,
  workspaceRootPath: string,
): string {
  if (dropToGap) {
    return getParentDirectoryPath(dropKey) || workspaceRootPath;
  }
  if (dropNodeIsDirectory) {
    return dropKey;
  }
  return getParentDirectoryPath(dropKey) || workspaceRootPath;
}
