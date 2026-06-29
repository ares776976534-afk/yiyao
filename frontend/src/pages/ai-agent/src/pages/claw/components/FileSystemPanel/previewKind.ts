import type { TypeFilePreviewKind } from './types';

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.ogg', '.mov', '.m4v']);
const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);
const ARCHIVE_EXT = new Set(['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz']);
/** SQLite 等数据库文件：二进制，不可当 UTF-8 文本预览 */
const DATABASE_BINARY_EXT = new Set(['.db', '.sqlite', '.sqlite3']);
const CODE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.scss',
  '.less',
  '.html',
  '.vue',
  '.java',
  '.go',
  '.py',
  '.rs',
  '.sql',
  '.yml',
  '.yaml',
  '.xml',
  '.sh',
]);

export function getExtensionFromPath(pathOrName: string): string {
  const clean = pathOrName.split('?')[0].split('#')[0];
  const base = clean.split('/').pop() ?? clean;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot).toLowerCase();
}

/**
 * 由 HTTP Content-Type 主类型推断预览形态；无法对应到现有预览器时返回 null（应回退扩展名）。
 * application/octet-stream 等泛型返回 null。
 */
export function inferPreviewKindFromMimeType(mime: string): TypeFilePreviewKind | null {
  const m = mime.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!m || m === 'application/octet-stream') {
    return null;
  }
  if (m.startsWith('image/')) {
    return 'image';
  }
  if (m.startsWith('video/')) {
    return 'video';
  }
  if (m.startsWith('audio/')) {
    return 'audio';
  }
  if (m === 'application/pdf') {
    return 'pdf';
  }
  if (
    m === 'application/zip' ||
    m === 'application/x-zip-compressed' ||
    m === 'application/x-rar-compressed' ||
    m === 'application/vnd.rar' ||
    m === 'application/x-7z-compressed' ||
    m === 'application/gzip' ||
    m === 'application/x-tar'
  ) {
    return 'archive';
  }
  if (
    m === 'application/msword' ||
    m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'officeWord';
  }
  if (
    m === 'application/vnd.ms-excel' ||
    m === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'officeExcel';
  }
  return null;
}

/**
 * Blob 预览时合并扩展名与 MIME：扩展名已明确为媒体类时，仅在 MIME 与扩展冲突不明显时仍以扩展为准。
 */
export function resolvePreviewKindForBlobResource(
  extKind: TypeFilePreviewKind,
  mimeType: string,
): TypeFilePreviewKind {
  const fromMime = inferPreviewKindFromMimeType(mimeType);
  if (fromMime === null) {
    return extKind;
  }
  const extIsMedia =
    extKind === 'image' || extKind === 'video' || extKind === 'audio' || extKind === 'pdf';
  if (extIsMedia) {
    if (fromMime === extKind) {
      return extKind;
    }
    return extKind;
  }
  return fromMime;
}

export function inferPreviewKindFromExtension(ext: string): TypeFilePreviewKind {
  if (!ext) return 'unknown';
  if (ext === '.md' || ext === '.markdown') return 'markdown';
  if (ext === '.pdf') return 'pdf';
  if (IMAGE_EXT.has(ext)) return 'image';
  if (VIDEO_EXT.has(ext)) return 'video';
  if (AUDIO_EXT.has(ext)) return 'audio';
  if (ext === '.csv') return 'plainText';
  if (ext === '.doc' || ext === '.docx') return 'officeWord';
  if (ext === '.xls' || ext === '.xlsx') return 'officeExcel';
  if (ARCHIVE_EXT.has(ext)) return 'archive';
  if (DATABASE_BINARY_EXT.has(ext)) return 'binary';
  if (CODE_EXT.has(ext)) return 'code';
  if (ext === '.txt' || ext === '.log' || ext === '.env' || ext === '.gitignore') return 'plainText';
  return 'plainText';
}

export function languageHintFromExtension(ext: string): string | undefined {
  const map: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.json': 'json',
    '.css': 'css',
    '.scss': 'scss',
    '.less': 'less',
    '.html': 'html',
    '.vue': 'vue',
    '.md': 'markdown',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.sql': 'sql',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.xml': 'xml',
    '.sh': 'shell',
  };
  return map[ext];
}

export function buildOfficeOnlineEmbedUrl(assetUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(assetUrl)}`;
}
