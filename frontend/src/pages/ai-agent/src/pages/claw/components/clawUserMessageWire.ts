import type { TypeClawUserWireAttachment } from './clawUserMessageWire.types';

const ATTACHMENT_LINE = /^\[attachment:([^\]]+)]\(([^)]+)\)\s*$/;

/**
 * 按协议拼接：首段为用户输入，后续每行一条 `[attachment:文件名](url)`。
 */
export function buildClawUserMessageWire(
  text: string,
  urlAttachments: { label: string; fileUrl: string }[],
): string {
  const t = text.replace(/\u200b/g, '').trimEnd();
  const lines: string[] = [];
  if (t) lines.push(t);
  urlAttachments.forEach((a) => {
    if (a.fileUrl && a.label) {
      lines.push(`[attachment:${a.label}](${a.fileUrl})`);
    }
  });
  return lines.join('\n');
}

/**
 * 从末尾连续匹配附件行，剩余作为用户正文（可含换行）。
 */
export function parseClawUserMessageWire(raw: string): {
  text: string;
  attachments: TypeClawUserWireAttachment[];
} {
  const s = raw.replace(/\u200b/g, '');
  if (!s.trim()) {
    return { text: '', attachments: [] };
  }
  const lines = s.split('\n');
  const attachments: TypeClawUserWireAttachment[] = [];
  let end = lines.length - 1;
  while (end >= 0) {
    const line = lines[end];
    const m = line.match(ATTACHMENT_LINE);
    if (!m) break;
    attachments.unshift({ name: m[1], url: m[2] });
    end -= 1;
  }
  const text = lines.slice(0, end + 1).join('\n').trimEnd();
  return { text, attachments };
}
