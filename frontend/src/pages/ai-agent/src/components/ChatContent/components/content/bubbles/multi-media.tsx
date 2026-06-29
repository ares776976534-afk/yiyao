import { useState, useEffect, useRef } from "react";
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

const MULTI_MEDIA_WIDTH = 106;
const MULTI_MEDIA_HEIGHT = 106;

interface TypeProgressState {
  isInQueue: boolean;
  queueWaitingSeconds: number;
  generateRemainingSeconds: number;
  hasTimeData: boolean;
  barPercent: number;
}

/**
 * 批量计算所有图片的进度状态
 * 在 render 时调用一次，所有图片共用同一个 now
 */
const calculateAllProgressStates = (
  multiImages: any[],
  now: number,
): Map<number, TypeProgressState> => {
  const states = new Map<number, TypeProgressState>();

  for (const imgData of multiImages) {
    const {
      mediaIndex,
      startTime,
      endTime,
      media_item,
      is_uncompleted: imgUncompleted,
      queueWaitingEndTime,
    } = imgData;

    // 判断是否已收到时间数据（startTime/endTime/queueWaitingEndTime 至少有一个非 0）
    const hasTimeData = !!(startTime || endTime || queueWaitingEndTime);

    const isUncompleted = imgUncompleted && !media_item;

    const progressState = getProgressState({
      is_uncompleted: isUncompleted,
      startTime,
      endTime,
      queueWaitingEndTime,
      now,
    });

    // 计算进度条百分比：
    // 排队阶段 startTime→queueWaitingEndTime
    // 生成阶段 startTime→endTime
    const barPercent = (() => {
      if (!isUncompleted) return 100;
      if (progressState.isInQueue) {
        return calculatePercent(startTime || 0, queueWaitingEndTime || 0, now);
      }
      return calculatePercent(startTime || 0, endTime || 0, now);
    })();

    states.set(mediaIndex, {
      ...progressState,
      hasTimeData,
      barPercent,
    });
  }

  return states;
};

function MultiImageBubble(props) {
  const { content, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const {
    sessionId,
    taskId,
    // 多图字段
    multiImages = [],
  } = content || {};

  // 用于触发重新渲染
  const [, forceUpdate] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 定时器：只要组件挂载就启动，卸载时清理
  useEffect(() => {
    timerRef.current = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return $t(
      "global-1688-ai-app.ChatContent.content.bubbles.multi-image.second",
      `${minutes ? `${minutes} 分` : ""}${seconds}秒`,
      [minutes ? `${minutes} 分` : "", seconds],
    );
  };

  // 检测当前主题
  const isDarkTheme =
    document.documentElement.getAttribute("data-theme") !== "light";
  const fallbackImage = isDarkTheme
    ? fallbackImages.dark
    : fallbackImages.light;

  // 批量计算所有图片的进度状态
  const now = Date.now();
  const progressStates = calculateAllProgressStates(multiImages, now);

  return (
    <div className={styles.designContainer}>
      <div className={styles.multiImageContent}>
        {multiImages.map((imgData) => {
          const {
            mediaIndex,
            media_item,
            is_uncompleted: imgUncompleted,
            failed,
          } = imgData;

          // 从预计算的 Map 中获取进度状态
          const progressState = progressStates.get(mediaIndex) || {
            isInQueue: false,
            queueWaitingSeconds: 0,
            generateRemainingSeconds: 0,
            hasTimeData: false,
            barPercent: 0,
          };
          const {
            isInQueue,
            queueWaitingSeconds,
            generateRemainingSeconds,
            barPercent,
          } = progressState;

          return (
            <div key={mediaIndex} className={styles.multiImageItem}>
              {/* 失败状态：显示兜底占位图 */}
              {failed && (
                <div className={styles.fallbackImageWrapper}>
                  <img
                    className={styles.fallbackImage}
                    src={fallbackImage}
                    alt={$t(
                      "global-1688-ai-app.ChatContent.content.bubbles.multi-media.zwt",
                      "占位图",
                    )}
                  />
                </div>
              )}

              {/* 生成中状态 */}
              {!failed && imgUncompleted && !media_item && (
                <div className={styles.uncompleted}>
                  <div
                    className={styles.progress}
                    style={{
                      width: MULTI_MEDIA_WIDTH,
                      height: MULTI_MEDIA_HEIGHT,
                    }}
                  >
                    {/* 排队、生成、超时阶段统一显示文案 */}
                    {progressState.hasTimeData && (
                      <>
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
              {!failed && media_item && (
                <Preview
                  type="assistant"
                  sessionId={sessionId}
                  taskId={taskId}
                  swiper={false}
                  medias={[media_item]}
                  width={MULTI_MEDIA_WIDTH}
                  height={MULTI_MEDIA_HEIGHT}
                  coverWidth={MULTI_MEDIA_WIDTH}
                  coverHeight={MULTI_MEDIA_HEIGHT}
                  isMobile={isMobile}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MultiImageBubble;
