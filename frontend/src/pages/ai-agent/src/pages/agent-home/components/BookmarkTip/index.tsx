import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { BookmarkTipStarIcon, BookmarkTipCloseIcon } from "./icons";
import { adeptKeyMap } from "@/components/studio-canvas/utils/shortcuts";
import { useStore } from "@/stores/context";
import { $t } from "@/i18n";
import styles from "./index.module.scss";

const BOOKMARK_TIP_FATIGUE_DAYS = 7; // 疲劳度:7天

const BookmarkTipContent = observer(() => {
  const store = useStore();
  const [isClosing, setIsClosing] = useState(false);

  // 根据疲劳度判断是否显示引导
  const visible = store.userPrefer.shouldShowGuide(
    "homeAddBrowserBookmarkCloseTime",
    BOOKMARK_TIP_FATIGUE_DAYS
  );

  const handleClose = () => {
    // 触发淡出动画
    setIsClosing(true);
    // 记录关闭时间戳到服务端和本地缓存
    store.userPrefer.updateGuide("homeAddBrowserBookmarkCloseTime", Date.now());
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // 只在淡出动画结束时处理
    if (e.animationName === "fadeOut" && isClosing) {
      setIsClosing(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`${styles.bookmarkTip} ${
        isClosing ? styles.bookmarkTipHidden : ""
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      <img
        className={styles.bookmarkTipIcon}
        src="https://img.alicdn.com/imgextra/i3/O1CN01xbNOlT1TpRwNXNIsq_!!6000000002431-2-tps-295-251.png"
      />
      <BookmarkTipCloseIcon
        className={styles.bookmarkTipCloseIcon}
        onClick={handleClose}
      />
      <div className={styles.bookmarkTipContainer}>
        <div className={styles.bookmarkTipHeader}>
          <BookmarkTipStarIcon />
          <div className={styles.bookmarkTipHeaderTitle}>
            {$t("global-1688-ai-app.bookmark-tip.header-title", "收藏该页面")}
          </div>
        </div>
        <div className={styles.bookmarkTipContent}>
          <div className={styles.bookmarkTipContentItem}>
            <span>
              {$t(
                "global-1688-ai-app.bookmark-tip.keyboard-shortcut",
                "键盘快捷键"
              )}
            </span>
            <span className={styles.contentBoldText}>
              {adeptKeyMap.control.label} + D
            </span>
          </div>
          <div className={styles.bookmarkTipContentItem}>
            {$t(
              "global-1688-ai-app.bookmark-tip.content",
              "收藏该页面到浏览器，下次更快访问～"
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BookmarkTipContent;
