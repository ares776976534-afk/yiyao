import React, { useState, useMemo, useRef, useCallback } from "react";
import { AnimatedMarkdown } from "flowtoken";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remend from "remend";
import { alphaCodeTheme } from "./codeTheme";
import styles from "./AlphaMarkdown.module.scss";
import "flowtoken/dist/styles.css";
import "@/styles/claw/index.scss";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AnimationType =
  | "fadeIn"
  | "blurIn"
  | "typewriter"
  | "slideInFromLeft"
  | "fadeAndScale"
  | "rotateIn"
  | "bounceIn"
  | "elastic"
  | "highlight"
  | "blurAndSharpen"
  | "dropIn"
  | "slideUp"
  | "wave"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export interface AlphaMarkdownProps {
  /** Markdown 文本 */
  text?: string;
  /** Markdown 文本 */
  content?: string;
  /** 等待首个 token 的加载动画 */
  loading?: boolean;
  /** 流式输出模式（启用动画 + 光标） */
  streaming?: boolean;
  /** 动画类型，默认 fadeIn */
  animation?: AnimationType;
  /** 动画持续时长，默认 0.35s */
  animationDuration?: string;
  /** 动画缓动函数，默认 ease-out */
  animationTimingFunction?: string;
  /** 拆分粒度 word | char，默认 word */
  sep?: "word" | "char";
  /** 自定义 class */
  className?: string;
  /** 自定义 style */
  style?: React.CSSProperties;
  /** 代码复制回调 */
  onCopyCode?: (code: string, language: string) => void;
  /** 表格复制回调 */
  onCopyTable?: (text: string) => void;
}

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

const CopySvg: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckSvg: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const DownloadSvg: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  CopyButton — 代码块复制                                              */
/* ------------------------------------------------------------------ */

interface CopyButtonProps {
  code: string;
  language: string;
  onCopy?: (code: string, language: string) => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ code, language, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.(code, language);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button className="am-code-copy" onClick={handleCopy} type="button">
      {copied ? <CheckSvg /> : <CopySvg />}
      <span>{copied ? "已复制" : "复制"}</span>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/*  TableBlock — 表格包裹容器（标题栏 + 复制 + 下载）                       */
/* ------------------------------------------------------------------ */

function tableToText(table: HTMLTableElement): string {
  return [...table.querySelectorAll("tr")]
    .map((row) =>
      [...row.querySelectorAll("th, td")]
        .map((cell) => cell.textContent?.trim() ?? "")
        .join("\t"),
    )
    .join("\n");
}

function tableToCsv(table: HTMLTableElement): string {
  return [...table.querySelectorAll("tr")]
    .map((row) =>
      [...row.querySelectorAll("th, td")]
        .map(
          (cell) => `"${(cell.textContent?.trim() ?? "").replace(/"/g, '""')}"`,
        )
        .join(","),
    )
    .join("\n");
}

interface TableBlockProps {
  children: React.ReactNode;
  onCopyTable?: (text: string) => void;
}

const TableBlock: React.FC<TableBlockProps> = ({ children, onCopyTable }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const table = wrapperRef.current?.querySelector("table");
    if (!table) return;
    try {
      const text = tableToText(table);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopyTable?.(text);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [onCopyTable]);

  const handleDownload = useCallback(() => {
    const table = wrapperRef.current?.querySelector("table");
    if (!table) return;
    const csv = tableToCsv(table);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "表格.csv";
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  }, []);

  return (
    <div className="am-table-block" ref={wrapperRef}>
      <div className="am-table-header">
        <span className="am-table-title">表格</span>
        <div className="am-table-actions">
          <button className="am-table-copy" onClick={handleCopy} type="button">
            {copied ? <CheckSvg /> : <CopySvg />}
          </button>
          <button
            className="am-table-download"
            onClick={handleDownload}
            type="button"
          >
            <DownloadSvg />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SyntaxHighlighter 的 pre 内联样式 — 完全覆盖 CSS .alpha-markdown pre  */
/* ------------------------------------------------------------------ */

const CODE_PRE_STYLE: React.CSSProperties = {
  margin: 0,
  padding: 0,
  background: "#fff",
  fontSize: "0.875em",
  lineHeight: "1.6",
  borderRadius: 0,
  border: "none",
  position: "static",
  overflow: "auto",
  boxShadow: "none",
  outline: "none",
};

const CODE_TAG_STYLE: React.CSSProperties = {
  fontFamily: 'var(--am-font-mono, "IBM Plex Mono", ui-monospace, monospace)',
};

/* ------------------------------------------------------------------ */
/*  AlphaMarkdown                                                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  ErrorBoundary                                                       */
/* ------------------------------------------------------------------ */

class AlphaMarkdownErrorBoundary extends React.Component<
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

/* ------------------------------------------------------------------ */
/*  Markdown Repair (for streaming)                                     */
/* ------------------------------------------------------------------ */

function repairMarkdown(text: string): string {
  if (!text) return text;

  // 1. 接入 Streamdown 的 remend 预处理管道，自动修复未闭合的加粗、斜体、内联代码、链接等
  let result = remend(text);

  // 2. 修复未闭合的代码块
  let fenceCount = 0;
  const lines = result.split("\n");
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) fenceCount++;
  }
  if (fenceCount % 2 === 1) {
    // 如果在代码块内，直接闭合并返回，不需要补全表格（避免代码块内的 | 误判为表格）
    return `${result}\n\`\`\``;
  }

  // 3. 修复未闭合的表格 (由于 remend 目前不支持表格，保留原有的表格防闪烁补丁)
  let lastPipeIdx = -1;
  for (let index = lines.length - 1; index >= 0; index--) {
    if (lines[index].includes("|")) {
      lastPipeIdx = index;
      break;
    }
  }

  if (lastPipeIdx >= 0) {
    // 允许表头后面跟着最多一个空行（AI打出换行但还没出|的瞬间）
    const trailingEmptyCount = lines.length - 1 - lastPipeIdx;
    if (trailingEmptyCount < 2) {
      // 向上寻找表格的起始行
      let tableStartIdx = lastPipeIdx;
      while (tableStartIdx >= 0 && lines[tableStartIdx].includes("|")) {
        tableStartIdx--;
      }
      tableStartIdx++;

      const tableLines = lines.slice(tableStartIdx, lastPipeIdx + 1);

      let isTable = false;
      if (tableLines.length === 1) {
        // 避免普通的句子带有 | 被误判为表头，导致结构在 <p> 和 <table> 之间剧烈闪烁
        // 但是对于流式输出，AI 可能只输出了 "| 技能名称 "
        // 如果这个时候我们不把它识别为表格并补全分隔行，它就会被渲染成普通文本
        // 直到 AI 输出完第一行并换行，它才突然变成表格，这就是导致“闪烁”的根本原因。
        // 所以，只要这一行以 | 开头，我们就立刻将它作为表格进行补全。
        if (tableLines[0].trim().startsWith("|")) {
          isTable = true;
        }
      } else if (tableLines.length >= 2) {
        // 多行情况，严格检查第二行是否是合法分隔行
        // 允许第二行只有一个 |，因为它可能刚开始输入分隔行
        if (
          /^[|\-\s:]*$/.test(tableLines[1].trim()) &&
          (tableLines[1].includes("-") || tableLines[1].trim() === "|")
        ) {
          isTable = true;
        }
      }

      if (isTable) {
        const getCols = (line: string) =>
          Math.max(
            1,
            line
              .trim()
              .replace(/^\||\|$/g, "")
              .split("|").length,
          );
        const headerCols = getCols(tableLines[0]);

        if (tableLines.length === 1) {
          // 只有表头，补全分隔行
          const separator = `|${Array(headerCols).fill("---").join("|")}|`;
          // 插入到 lastPipeIdx 的下一行
          lines.splice(lastPipeIdx + 1, 0, separator);

          // 如果表头尚未闭合，先将其闭合，防止在 <p> 和 <table> 之间闪烁
          if (!lines[lastPipeIdx].trim().endsWith("|")) {
            lines[lastPipeIdx] += " |";
          }

          result = lines.join("\n");
        } else if (
          tableLines.length === 2 &&
          (/^[|\-\s:]*$/.test(tableLines[1].trim()) ||
            tableLines[1].trim() === "|")
        ) {
          // 正在输入分隔行，补全分隔符
          const currentCols =
            tableLines[1].trim() === "|" ? 0 : getCols(tableLines[1]);

          if (currentCols < headerCols) {
            const padding = Array(headerCols - currentCols)
              .fill("---")
              .join("|");
            lines[lastPipeIdx] = `${lines[lastPipeIdx]}${
              lines[lastPipeIdx].endsWith("|") ? "" : "|"
            }${padding}|`;
            result = lines.join("\n");
          } else if (!lines[lastPipeIdx].trim().endsWith("|")) {
            lines[lastPipeIdx] += "|";
            result = lines.join("\n");
          }
        } else {
          // 正在输入数据行，闭合管道符
          if (!lines[lastPipeIdx].trim().endsWith("|")) {
            lines[lastPipeIdx] += " |";
            result = lines.join("\n");
          }
        }
      }
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  AlphaMarkdownInner                                                  */
/* ------------------------------------------------------------------ */

const AlphaMarkdownInner: React.FC<AlphaMarkdownProps> = ({
  content,
  text,
  loading = false,
  streaming = false,
  animation = "fadeIn",
  animationDuration = "0.35s",
  animationTimingFunction = "ease-out",
  sep = "word",
  className,
  style,
  onCopyCode,
  onCopyTable,
}) => {
  const customComponents = useMemo(
    () => ({
      // 移除 react-markdown 的外层 <pre>，由自定义 code 组件自行渲染代码块
      pre: ({ children }: any) => <>{children}</>,

      // 代码块 / 行内代码
      code: ({
        className: codeClassName,
        children,
        animateText,
        ...props
      }: any) => {
        if (!codeClassName || !codeClassName.startsWith("language-")) {
          return <code {...props}>{animateText(children)}</code>;
        }

        const language = codeClassName.replace("language-", "");
        const codeString = String(children).replace(/\n$/, "");

        return (
          <div className="am-code-block">
            <div className="am-code-header">
              <span className="am-code-lang">{language}</span>
              <CopyButton
                code={codeString}
                language={language}
                onCopy={onCopyCode}
              />
            </div>
            <SyntaxHighlighter
              style={alphaCodeTheme}
              language={language}
              customStyle={CODE_PRE_STYLE}
              codeTagProps={{ style: CODE_TAG_STYLE }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      },

      // 表格 — 包裹 .am-table-block（标题栏 + 复制 + 下载 CSV）
      table: ({ children, ...props }: any) => (
        <TableBlock onCopyTable={onCopyTable}>
          <table {...props}>{children}</table>
        </TableBlock>
      ),
    }),
    [onCopyCode, onCopyTable],
  );

  const cls = [
    "alpha-markdown",
    streaming ? "am-streaming" : "",
    styles.root,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rawContent = content || text || "";
  const finalContent = useMemo(() => {
    return streaming ? repairMarkdown(rawContent) : rawContent;
  }, [streaming, rawContent]);

  if (loading) {
    return (
      <div
        className={`alpha-markdown ${styles.root} ${className ?? ""}`.trim()}
        style={style}
      >
        <div className="am-loading">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className={`${cls ?? ""}`} style={style}>
      <AnimatedMarkdown
        content={finalContent}
        animation={streaming ? animation : null}
        animationDuration={animationDuration}
        animationTimingFunction={animationTimingFunction}
        sep={sep}
        codeStyle={alphaCodeTheme}
        customComponents={customComponents}
      />
    </div>
  );
};

export const AlphaMarkdown: React.FC<AlphaMarkdownProps> = (props) => (
  <AlphaMarkdownErrorBoundary>
    <AlphaMarkdownInner {...props} />
  </AlphaMarkdownErrorBoundary>
);

export default AlphaMarkdown;
