import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as remarkGfmNS from 'remark-gfm';
import styles from './index.module.scss';
import classNames from 'classnames';
import rehypeRaw from 'rehype-raw';

// 流式显示配置
export const STREAMING_CONFIG = {
  // 字符级别流式显示间隔（毫秒）
  CHAR_INTERVAL: 10,

  // 块级别流式显示间隔（毫秒）
  BLOCK_INTERVAL: 200,

  // 默认流式显示间隔（毫秒）
  DEFAULT_INTERVAL: 200,

  // 快速流式显示间隔（毫秒）
  FAST_INTERVAL: 50,

  // 慢速流式显示间隔（毫秒）
  SLOW_INTERVAL: 300,
} as const;


type MarkdownProps = {
  text?: string;
  simulateStream?: boolean;
  chunkIntervalMs?: number;
  streamGranularity?: 'block' | 'char';
  onStreamComplete?: () => void;
  textColor?: string; // 自定义文本颜色
  isReplay?: boolean;
};

class MarkdownErrorBoundary extends React.Component<{ raw: string; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { raw: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Markdown render error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{this.props.raw}</div>
      );
    }
    return this.props.children as any;
  }
}

export const Markdown = ({ text, simulateStream = false, chunkIntervalMs = STREAMING_CONFIG.DEFAULT_INTERVAL, streamGranularity = 'block', onStreamComplete, isReplay = false, textColor }: MarkdownProps) => {
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  // const workerRef = useRef<Worker | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // const chunks = useMemo(() => {
  //   if (!text) return [] as string[];
  //   if (streamGranularity === 'char') {
  //     return Array.from(text);
  //   }
  //   const lines = text.split('\n');
  //   const result: string[] = [];
  //   let buffer: string[] = [];
  //   let inCodeBlock = false;

  //   const flush = () => {
  //     if (buffer.length > 0) {
  //       result.push(buffer.join('\n'));
  //       buffer = [];
  //     }
  //   };

  //   for (const line of lines) {
  //     const isFence = line.trim().startsWith('```');
  //     if (isFence) {
  //       inCodeBlock = !inCodeBlock;
  //       buffer.push(line);
  //       if (!inCodeBlock) {
  //         flush();
  //       }
  //       continue;
  //     }

  //     buffer.push(line);
  //     if (!inCodeBlock && line.trim() === '') {
  //       flush();
  //     }
  //   }
  //   flush();
  //   return result.filter((chunk) => chunk.trim().length > 0);
  // }, [text, streamGranularity]);

  useEffect(() => {
    setMounted(true);

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // useEffect(() => {
  //   if (!simulateStream || isReplay) {
  //     setDisplayedContent(text || '');
  //     return;
  //   }
  //   setDisplayedContent('');
  //   if (!chunks.length) return;

  //   // 创建 Web Worker 处理后台流式输出
  //   const createWorker = () => {
  //     const workerCode = `
  //       let intervalId = null;
  //       let currentIndex = 0;
  //       let chunks = [];
  //       let chunkIntervalMs = 0;
  //       let streamGranularity = 'block';

  //       self.onmessage = function(e) {
  //         const { type, data } = e.data;

  //         switch (type) {
  //           case 'start':
  //             chunks = data.chunks;
  //             chunkIntervalMs = data.chunkIntervalMs;
  //             streamGranularity = data.streamGranularity;
  //             currentIndex = 0;

  //             if (intervalId) clearInterval(intervalId);

  //             intervalId = setInterval(() => {
  //               if (currentIndex >= chunks.length) {
  //                 clearInterval(intervalId);
  //                 self.postMessage({ type: 'complete' });
  //                 return;
  //               }

  //               const chunk = chunks[currentIndex];
  //               self.postMessage({
  //                 type: 'chunk',
  //                 data: {
  //                   chunk,
  //                   index: currentIndex,
  //                   isLast: currentIndex === chunks.length - 1
  //                 }
  //               });
  //               currentIndex++;
  //             }, chunkIntervalMs);
  //             break;

  //           case 'stop':
  //             if (intervalId) {
  //               clearInterval(intervalId);
  //               intervalId = null;
  //             }
  //             break;
  //         }
  //       };
  //     `;

  //     const blob = new Blob([workerCode], { type: 'application/javascript' });
  //     return new Worker(URL.createObjectURL(blob));
  //   };

  //   // 使用 Web Worker 进行流式输出
  //   workerRef.current = createWorker();

  //   workerRef.current.onmessage = (event) => {
  //     const { type, data } = event.data;

  //     if (type === 'chunk') {
  //       const { chunk, isLast } = data;

  //       setDisplayedContent((prev) => {
  //         let newContent;
  //         if (streamGranularity === 'char') {
  //           newContent = `${prev}${chunk}`;
  //         } else {
  //           newContent = prev ? `${prev}\n\n${chunk}` : chunk;
  //         }
  //         return newContent;
  //       });

  //       if (isLast) {
  //         onStreamComplete?.();
  //       }
  //     } else if (type === 'complete') {
  //       onStreamComplete?.();
  //     }
  //   };

  //   // 启动流式输出
  //   workerRef.current.postMessage({
  //     type: 'start',
  //     data: {
  //       chunks,
  //       chunkIntervalMs,
  //       streamGranularity,
  //     },
  //   });

  //   return () => {
  //     if (workerRef.current) {
  //       workerRef.current.postMessage({ type: 'stop' });
  //       workerRef.current.terminate();
  //       workerRef.current = null;
  //     }
  //   };
  // }, [simulateStream, chunks, chunkIntervalMs, text, streamGranularity, onStreamComplete]);

  if (!mounted) return null;
  // if (!simulateStream && !text) return null;
  if (!text) return null;

  const gfmCandidate: any = (remarkGfmNS as any)?.default ?? (remarkGfmNS as any);
  const remarkPlugins = typeof gfmCandidate === 'function' ? [gfmCandidate] : [];

  // 处理自定义标签：替换为标准 HTML 标签
  const processCustomTags = (content: string) => {
    return content
      // 替换 <qwen:takeaway>...</qwen:takeaway> 为 <p class="qwen-takeaway">...</p>
      .replace(/<qwen:takeaway([^>]*)>([\s\S]*?)<\/qwen:takeaway>/gi, '<p class="qwen-takeaway"$1>$2</p>')
      // 替换 <qwen:cite>...</qwen:cite> 为 <a class="qwen-cite">...</a>
      .replace(/<qwen:cite([^>]*)>([\s\S]*?)<\/qwen:cite>/gi, '<a class="qwen-cite"$1>$2</a>');
  };

  // const raw = simulateStream ? displayedContent : (text || '');
  const raw = processCustomTags(text || '');
  const style = textColor ? { '--markdown-text-color': textColor } as React.CSSProperties & { '--markdown-text-color'?: string } : undefined;
  // console.log(raw, remarkPlugins, 'remarkPlugins');
  return (
    <div
      className={classNames(styles.mobileMarkdownComponent, 'mobile-markdown')}
      style={style}
    >
      <MarkdownErrorBoundary raw={raw}>
        <ReactMarkdown
          remarkPlugins={remarkPlugins as any}
          rehypePlugins={[rehypeRaw] as any}
          components={{
            ul: (props) => (
              <ul {...props} />
            ),
            img: ({ src, alt, ...props }) => (
              <img
                src={src}
                alt={alt}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                }}
                {...props}
              />
            ),
            ol: ({ start, ...props }) => (
              <ol
                {...props}
                style={{
                  counterReset: `item ${(start || 1) - 1}`,
                }}
              />
            ),
            a: (props: any) => {
              return <a {...props} href={props.href || props.url || '#'} target="_blank" rel="noopener noreferrer" />;
            },
            table: (props) => (
              <div className={styles.tableWrapper}>
                <table {...props} />
              </div>
            ),
          } as any}
        >
          {raw}
        </ReactMarkdown>
      </MarkdownErrorBoundary>
    </div>
  );
};
