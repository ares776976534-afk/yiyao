import React from 'react';
import { AlphaMarkdown as MarkdownContent } from '@/pages/claw/components/AlphaMarkdown';
import type { TypeFileContentPayload } from './types';
import { buildOfficeOnlineEmbedUrl } from './previewKind';
import styles from './index.module.scss';

interface TypeFilePreviewProps {
  payload: TypeFileContentPayload;
  fileName: string;
  fullPath: string;
}

const FilePreview: React.FC<TypeFilePreviewProps> = ({ payload, fileName, fullPath }) => {
  const { previewKind, content, url, mimeType } = payload;
  const codeLines = content.split('\n');

  if (previewKind === 'markdown') {
    return (
      <div className={styles.markdownWrap}>
        <MarkdownContent text={content} />
      </div>
    );
  }

  if (previewKind === 'plainText' || previewKind === 'code') {
    return (
      <div className={styles.codeWrap}>
        <div className={styles.lineNumbers}>
          {codeLines.map((_line, lineIndex) => (
            <div key={lineIndex + 1}>{lineIndex + 1}</div>
          ))}
        </div>
        <pre className={styles.codeBlock}>
          <code>{content}</code>
        </pre>
      </div>
    );
  }

  if (previewKind === 'image') {
    return (
      <div className={styles.mediaWrap}>
        <img className={styles.previewImage} src={url} alt={fileName} />
      </div>
    );
  }

  if (previewKind === 'video') {
    return (
      <div className={styles.mediaWrap}>
        <video className={styles.previewVideo} controls src={url} preload="metadata">
          您的浏览器不支持视频播放
        </video>
      </div>
    );
  }

  if (previewKind === 'audio') {
    return (
      <div className={styles.mediaWrap}>
        <audio className={styles.previewAudio} controls src={url} preload="metadata">
          您的浏览器不支持音频播放
        </audio>
      </div>
    );
  }

  if (previewKind === 'pdf') {
    return (
      <div className={styles.embedWrap}>
        <iframe className={styles.previewIframe} title={fileName} src={url} />
      </div>
    );
  }

  if (previewKind === 'officeWord' || previewKind === 'officeExcel') {
    if (!url) {
      return (
        <div className={styles.binaryNotice}>
          <div className={styles.binaryTitle}>未配置文档直链</div>
          <p className={styles.binaryDesc}>
            Word / Excel 预览需要接口返回可公网访问的 https 直链，以便 Office Online 嵌入。
          </p>
        </div>
      );
    }
    const embedSrc = buildOfficeOnlineEmbedUrl(url);
    const label = previewKind === 'officeWord' ? 'Word' : 'Excel';
    return (
      <div className={styles.embedWrap}>
        <iframe className={styles.previewIframe} title={`${label} ${fileName}`} src={embedSrc} />
        <p className={styles.embedHint}>
          使用 Microsoft Office Online 嵌入预览；若无法显示，请
          <a className={styles.embedLink} href={url} target="_blank" rel="noopener noreferrer">
            在新窗口打开原文件
          </a>
          。
        </p>
      </div>
    );
  }

  if (previewKind === 'archive') {
    return (
      <div className={styles.binaryNotice}>
        <div className={styles.binaryTitle}>压缩包（二进制）</div>
        {/* <p className={styles.binaryDesc}>
          请下载后本地解压查看。
        </p>
        <a className={styles.binaryDownload} href={url} target="_blank" rel="noopener noreferrer">
          下载 {fileName}
        </a>
        <p className={styles.binaryMeta} title={fullPath}>
          {url}
        </p> */}
      </div>
    );
  }

  if (previewKind === 'binary') {
    return (
      <div className={styles.binaryNotice}>
        <div className={styles.binaryTitle}>无法在线预览</div>
        <p className={styles.binaryDesc} title={fullPath}>
          {fileName}：此类文件无法在侧栏直接展示，请使用工具栏「下载」保存到本地查看。
        </p>
        {mimeType ? <p className={styles.binaryMeta}>Content-Type: {mimeType}</p> : null}
      </div>
    );
  }

  if (previewKind === 'unknown') {
    return (
      <div className={styles.binaryNotice}>
        <div className={styles.binaryTitle}>无法识别预览类型</div>
        <p className={styles.binaryDesc}>请尝试下载文件查看，或联系后端返回 previewKind。</p>
        {mimeType ? <p className={styles.binaryMeta}>Content-Type: {mimeType}</p> : null}
        <a className={styles.binaryDownload} href={url} target="_blank" rel="noopener noreferrer">
          打开链接
        </a>
      </div>
    );
  }

  return (
    <div className={styles.binaryNotice}>
      <div className={styles.binaryTitle}>暂不支持预览</div>
      <p className={styles.binaryDesc}>{fileName}</p>
    </div>
  );
};

export default FilePreview;
