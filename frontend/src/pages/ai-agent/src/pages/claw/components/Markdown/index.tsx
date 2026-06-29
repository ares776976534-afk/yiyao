import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import * as clipboard from 'clipboard-polyfill';
import '@/styles/claw/index.scss';

const copySvg = '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>';
const checkSvg = '<path d="M20 6 9 17l-5-5"/>';

function flashIcon(btn, duration) {
  btn.querySelector('svg').innerHTML = checkSvg;
  setTimeout(() => { btn.querySelector('svg').innerHTML = copySvg; }, duration);
}

const copyCode = (btn: HTMLButtonElement) => {
  const code = btn.closest('.am-code-block')?.querySelector('pre code');
  if (!code) return;

  clipboard.writeText(code.innerText).then(() => {
    const label = btn.querySelector('span');
    if (!label) return;
    const orig = label.textContent;
    if (!orig) return;
    label.textContent = '已复制';
    flashIcon(btn, 2000);
    setTimeout(() => { label.textContent = orig; }, 2000);
  });
};

class MarkdownErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <span>内容出错，请稍后重试</span>;
    }
    return this.props.children;
  }
}

function MarkdownContentInner({ text }: { text: string }) {
  if (!text.trim()) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm as any]}
      components={{
        a: (props) => (
          <a {...props} href={props.href || '#'} target="_blank" rel="noopener noreferrer" />
        ),
        img: (props) => (
          <img
            {...props}
            alt={props.alt || ''}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
          />
        ),
        pre: (props) => {
          if (props.node?.children?.[0]?.tagName === 'code') {
            return props.children;
          }

          return (
            <pre className={props.className}>
              {props.children}
            </pre>
          );
        },
        code: (props) => {
          const codeLanguage = props.className?.replace('language-', '');

          return (
            <div className="am-code-block">
              <div className="am-code-header">
                <span className="am-code-lang">{codeLanguage}</span>
                <button className="am-code-copy" onClick={(e) => copyCode(e.currentTarget)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                  <span>复制</span>
                </button>
              </div>
              <pre>
                <code {...props} />
              </pre>
            </div>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function MarkdownContent({ text, className }: { text: string, className?: string }) {
  return (
    <MarkdownErrorBoundary>
      <div className={`alpha-markdown ${className}`}>
        <MarkdownContentInner text={text} />
      </div>
    </MarkdownErrorBoundary>
  );
}