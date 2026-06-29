import { useEffect, useState, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import pcStyles from './index.module.scss';
import mobileStyles from './index.mobile.module.scss';

export default function AnalyzerBubble(props) {
  const { content, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const { title, content: contentText, is_uncompleted, icon } = content || {};

  const [collapsed, setCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCollapsed, setShowCollapsed] = useState(false);

  useEffect(() => {
    // if (contentText && is_uncompleted) {
    //   // 使用 ref 直接操作滚动，确保 DOM 完全更新后再滚动
    //   const scrollToBottom = () => {
    //     if (containerRef.current) {
    //       containerRef.current.scrollTop = containerRef.current.scrollHeight;
    //     }
    //   };

    //   if (containerRef.current && containerRef.current.scrollHeight > 66 && !showContentMask) {
    //     setShowContentMask(true);
    //   }

    //   scrollToBottom();
    // }

    // if (!is_uncompleted) {
    //   if (containerRef.current) {
    //     containerRef.current.scrollTo({
    //       top: 0,
    //       behavior: 'smooth',
    //     });
    //   }
    // }

    if (is_uncompleted) {
      // 不折叠
      setCollapsed(false);
      setShowCollapsed(false);
    } else {
      if (containerRef.current && containerRef.current.offsetHeight > 82) {
        // 内容高度不大于82px时，不折叠也不展示折叠按钮
        setShowCollapsed(true);
        setCollapsed(true);
      }
    }
  }, [contentText, is_uncompleted]);

  return (
    <div className={styles.analyzerContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {icon && (
            <div
              className={styles.icon}
              style={{ maskImage: `url(${icon})` }}
            />
          )}
          <div className={styles.title}>{title}</div>
        </div>
        {showCollapsed && (
          <div
            className={styles.arrowDown}
            style={{
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
            onClick={() => setCollapsed(!collapsed)}
          />
        )}
      </div>
      <div className={styles.analyzerContent}>
        <div
          ref={containerRef}
          className={styles.markdownContainer}
          style={{
            height: collapsed ? '78px' : 'auto',
          }}
        >
          <Markdown remarkPlugins={[remarkGfm as any]}>{contentText}</Markdown>
        </div>

        {!is_uncompleted && collapsed && (
          <div className={styles.collapsedMask} />
        )}
      </div>
    </div>
  );
}
