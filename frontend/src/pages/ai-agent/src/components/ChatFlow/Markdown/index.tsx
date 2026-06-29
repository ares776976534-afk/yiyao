import React, { useMemo } from 'react';
import styles from './index.module.css';
import { AnimatedMarkdown } from 'flowtoken';
import ReportContent from '@/pages/select-product/general-agent/components/FormatList/ReportContent';
import 'flowtoken/dist/styles.css';

type MarkdownProps = {
  text?: string;
  simulateStream?: boolean;
  chunkIntervalMs?: number;
  streamGranularity?: 'block' | 'char';
  onStreamComplete?: () => void;
  textColor?: string; // 自定义文本颜色
  isReplay?: boolean;
  className?: string;
};

export const Markdown = ({ text, textColor, className}: MarkdownProps) => {
  if (!text) return null;
  const style = textColor ? { '--markdown-text-color': textColor } as React.CSSProperties & { '--markdown-text-color'?: string } : undefined;

  const customComponents = useMemo(() => {
    return {
      // ul: (props) => (
      //   <ul {...props} />
      // ),
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
      a: (props: any) => {
        return <a {...props} target="_blank" rel="noopener noreferrer" />;
      },
      p: ({ children, ...props }: any) => {
        const _children = typeof children === 'string' ? children.trim() : children;
        return _children ? <p {...props}>{_children}</p> : null;
      },
      span: ({ children, ...props }: any) => {
        const _children = typeof children === 'string' ? children.trim() : children;
        return _children ? <span {...props}>{_children}</span> : null;
      },
      li: ({ children, ...props }: any) => {
        const _children = typeof children === 'string' ? children.trim() : children;
        return _children ? <li {...props}>{_children}</li> : null;
      },
    };
  }, []);

  return (
    <div
      className={`${styles.markdown} markdown-component rightMardown ${className}`}
      style={style}
    >
      <ReportContent rawData={text} />
    </div>
  );
};
