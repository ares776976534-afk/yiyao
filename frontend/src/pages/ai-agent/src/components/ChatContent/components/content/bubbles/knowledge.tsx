import { useLayoutEffect, useRef, useState } from "react";
import classNames from "classnames";
import { $t } from "@/i18n";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";

const MAX_ROWS = 3;

export default function KnowledgeBubble(props) {
  const { content, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const {
    keywords = [],
    description = "",
    title = $t(
      "global-1688-ai-app.ChatContent.content.bubbles.knowledge.zsk",
      "知识库",
    ),
    icon,
  } = content || {};

  const realCounts = keywords.length;
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(realCounts);
  const [rowCount, setRowCount] = useState(1);

  useLayoutEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const items = Array.from(container.children) as HTMLElement[];
    if (items.length === 0) return;

    let rows = 1;

    for (let idx = 1; idx < items.length; idx++) {
      // 检测换行：当前item的top大于上一个item的top
      if (items[idx].offsetTop > items[idx - 1].offsetTop) {
        rows++;
      }

      // 找到第4行的第一个元素，截断到上一个index
      if (rows > MAX_ROWS) {
        setVisibleCount(idx);
        setRowCount(MAX_ROWS);
        return;
      }
    }

    setVisibleCount(items.length);
    setRowCount(rows);
  }, [keywords]);

  const visibleKeywords = keywords.slice(0, visibleCount);
  // 3行及以上显示蒙层
  const hasOverflow = rowCount >= MAX_ROWS;

  return (
    <div
      className={classNames(styles.knowledgeContainer, {
        [styles.hasOverflow]: hasOverflow,
      })}
    >
      <div className={styles.header}>
        {icon && (
          <div className={styles.icon} style={{ maskImage: `url(${icon})` }} />
        )}
        <div className={styles.title}>{title}</div>
      </div>

      {description && <div className={styles.description}>{description}</div>}

      <div className={styles.knowledgeList} ref={listRef}>
        {visibleKeywords.map((keyword) => {
          return (
            <div className={styles.knowledgeItem} key={keyword}>
              <div className={styles.knowledgeName} title={keyword}>
                {keyword}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
