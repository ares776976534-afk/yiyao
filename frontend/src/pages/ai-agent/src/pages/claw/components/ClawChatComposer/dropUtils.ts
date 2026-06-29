import type { TypeClawChatDataTransferItem } from './dropTypes';

export function hasFileKindPayload(dt: DataTransfer | null): boolean {
  if (!dt) return false;
  if (dt.items && dt.items.length > 0) {
    return Array.from(dt.items).some((item) => item.kind === 'file');
  }
  return (dt.files?.length ?? 0) > 0;
}

function trimRefPath(fullPath: string): string {
  return fullPath.replace(/^\/+/, '');
}

function dedupe(paths: string[]): string[] {
  return [...new Set(paths.filter(Boolean))];
}

function longestCommonPathPrefix(paths: string[]): string {
  const parts = paths.map((p) => p.split('/').filter(Boolean));
  if (parts.length === 0) return '';
  const minLen = Math.min(...parts.map((a) => a.length));
  const out: string[] = [];
  for (let i = 0; i < minLen; i++) {
    const seg = parts[0][i];
    if (parts.every((a) => a[i] === seg)) {
      out.push(seg);
    } else {
      break;
    }
  }
  return out.join('/');
}

function summarizeRelativePaths(relativePaths: string[]): string[] {
  const unique = dedupe(relativePaths);
  if (unique.length === 0) return [];
  if (unique.length === 1) {
    return [`@${unique[0]}`];
  }
  const prefix = longestCommonPathPrefix(unique);
  const allUnderPrefix = unique.every(
    (p) => p === prefix || p.startsWith(`${prefix}/`),
  );
  if (prefix && allUnderPrefix) {
    return [`@${prefix}/`];
  }
  const maxInline = 15;
  if (unique.length <= maxInline) {
    return unique.map((p) => `@${p}`);
  }
  const head = prefix || unique[0].split('/')[0] || unique[0];
  return [`@${head}/`];
}

function readDirectoryPlaceholder(entry: FileSystemDirectoryEntry): Promise<string> {
  return new Promise((resolve) => {
    const reader = entry.createReader();
    reader.readEntries(
      () => {
        const raw = entry.fullPath || `/${entry.name}`;
        resolve(`${trimRefPath(raw)}/`);
      },
      () => {
        const raw = entry.fullPath || `/${entry.name}`;
        resolve(`${trimRefPath(raw)}/`);
      },
    );
  });
}

export async function collectDroppedPathReferences(dt: DataTransfer): Promise<string[]> {
  const files = Array.from(dt.files ?? []);
  if (files.some((f) => f.webkitRelativePath)) {
    const rels = files.map((f) => f.webkitRelativePath || f.name);
    return summarizeRelativePaths(rels);
  }
  if (files.length > 0) {
    return files.map((f) => `@${trimRefPath(f.name)}`);
  }

  const items = Array.from(dt.items ?? []).filter((i) => i.kind === 'file');
  if (items.length === 0) return [];

  const syncPaths: string[] = [];
  const asyncReads: Promise<string>[] = [];

  for (const item of items) {
    const entry = (item as TypeClawChatDataTransferItem).webkitGetAsEntry?.();
    if (entry?.isFile) {
      const raw = entry.fullPath || `/${entry.name}`;
      syncPaths.push(`@${trimRefPath(raw)}`);
    } else if (entry?.isDirectory) {
      asyncReads.push(
        readDirectoryPlaceholder(entry).then((p) => `@${trimRefPath(p)}`),
      );
    } else {
      const f = item.getAsFile();
      if (f) {
        syncPaths.push(`@${trimRefPath(f.name)}`);
      }
    }
  }

  const asyncPart = await Promise.all(asyncReads);
  return dedupe([...syncPaths, ...asyncPart]);
}
