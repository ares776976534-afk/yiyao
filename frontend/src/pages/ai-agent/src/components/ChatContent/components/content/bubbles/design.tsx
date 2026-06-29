import { useState, useEffect } from "react";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
import Preview from "./preview";
import {
  getProgressState,
  calculatePercent,
  getProgressText,
} from "../../../utils";
import { fallbackImages } from "../../../assets";
import { $t } from "@/i18n";

const WIDTH = 280;
const HEIGHT = 280;

export default function DesignBubble(props) {
  const { content, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const {
    sessionId,
    taskId,
    media_items = [],
    is_uncompleted = false,
    failed = false,
    startTime,
    endTime,
    queueWaitingEndTime, // 排队等待结束时间
  } = content || {};

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [, forceUpdate] = useState(0);

  // 定时更新百分比
  useEffect(() => {
    if (!is_uncompleted) {
      return;
    }
    // 每秒更新一次百分比
    const timer = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [is_uncompleted]);

  // 使用公共函数计算进度状态
  const { isInQueue, queueWaitingSeconds, generateRemainingSeconds } =
    getProgressState({
      is_uncompleted,
      startTime,
      endTime,
      queueWaitingEndTime,
    });

  // 计算进度条百分比：
  // 排队阶段 startTime→queueWaitingEndTime
  // 生成阶段 startTime→endTime
  const barPercent = (() => {
    if (!is_uncompleted) return 100;
    if (isInQueue) {
      return calculatePercent(startTime || 0, queueWaitingEndTime || 0);
    }
    return calculatePercent(startTime || 0, endTime || 0);
  })();

  // 检测当前主题
  const isDarkTheme =
    document.documentElement.getAttribute("data-theme") !== "light";
  const fallbackImage = isDarkTheme
    ? fallbackImages.dark
    : fallbackImages.light;

  // 判断是否应该显示兜底图：失败状态 或者 没有未完成但也没有图片数据
  const shouldShowFallback =
    failed || (!is_uncompleted && (!media_items || media_items.length === 0));

  return (
    <div className={styles.designContainer}>
      <div className={styles.content}>
        {/* 失败状态或空数据：显示兜底占位图 */}
        {shouldShowFallback && (
          <div className={styles.fallbackImageWrapper}>
            <img
              className={styles.fallbackImage}
              src={fallbackImage}
              alt={$t(
                "global-1688-ai-app.ChatContent.content.bubbles.design.zwt",
                "占位图",
              )}
              style={{ width: WIDTH, height: HEIGHT }}
            />
          </div>
        )}

        {/* 生成中状态 */}
        {!shouldShowFallback && !mediaLoaded && (
          <div className={styles.uncompleted}>
            <div
              className={styles.progress}
              style={{ width: WIDTH, height: HEIGHT }}
            >
              {is_uncompleted && (
                <>
                  {/* 排队、生成、超时阶段统一显示文案 */}
                  <span className={styles.progressTextLine}>
                    {getProgressText(
                      isInQueue,
                      queueWaitingSeconds,
                      generateRemainingSeconds,
                      $t,
                    )}
                  </span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 生成完成状态 */}
        {!shouldShowFallback && media_items && media_items.length > 0 && (
          <div style={{ display: mediaLoaded ? "block" : "none" }}>
            <Preview
              type="assistant"
              sessionId={sessionId}
              taskId={taskId}
              swiper
              style={{ flexwrap: "nowrap", overflowx: "auto", gap: "16px" }}
              medias={media_items}
              width={WIDTH}
              height={HEIGHT}
              coverWidth={WIDTH}
              coverHeight={HEIGHT}
              isMobile={isMobile}
              onLoad={() => {
                setMediaLoaded(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
