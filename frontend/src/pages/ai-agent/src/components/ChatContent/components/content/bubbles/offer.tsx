import { memo, useState, useEffect } from "react";
import classNames from "classnames";
import { Button } from "antd";
import ProgressiveImage from "@/components/ProgressiveImage";
import { useStore } from "@/stores/context";
import {
  getProgressState,
  calculatePercent,
  getProgressText,
} from "../../../utils";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
import { $t } from "@/i18n";

interface TypeSkuPropValue {
  imageUrl?: string;
  name?: string;
}

interface TypeSkuProp {
  fid?: string;
  prop?: string;
  value?: TypeSkuPropValue[];
}

interface TypeOfferInfo {
  mediaId?: string;
  offerId?: number;
  title?: string;
  images?: string[];
  productAttribute?: Array<{ attributeName: string; value: string }>;
  skuProps?: TypeSkuProp[];
}

interface TypeOfferCardProps extends TypeOfferInfo {
  styles: Record<string, string>;
  isShared?: boolean;
  isMobile?: boolean;
}

interface TypeOfferBubbleProps {
  content?: {
    content?: TypeOfferInfo[];
    cardId?: string;
    startTime?: number;
    endTime?: number;
    queueWaitingEndTime?: number; // 排队等待结束时间
    is_uncompleted?: boolean;
    failed?: boolean;
  };
  isShared?: boolean;
  isMobile?: boolean;
}

/**
 * 根据规则获取展示图片列表
 * ≥3张：展示前3张
 * 2张：重复展示2张（共4张取前3张 = 原2张 + 第1张）
 * 1张：重复展示3张同一图片
 */
const getDisplayImages = (images: string[]): string[] => {
  const len = images.length;
  if (len >= 3) {
    return images.slice(0, 3);
  }
  if (len === 2) {
    return [images[0], images[1], images[0]];
  }
  if (len === 1) {
    return [images[0], images[0], images[0]];
  }
  return [];
};

/**
 * 计算素材总数：mainImages数量 + skuProps里所有imageUrl的数量
 */
const getTotalMaterialCount = (
  images: string[],
  skuProps: TypeSkuProp[],
): number => {
  const mainCount = images.length;
  const skuCount = skuProps.reduce((acc, prop) => {
    const imageCount = (prop.value || []).filter((v) => v.imageUrl).length;
    return acc + imageCount;
  }, 0);
  return mainCount + skuCount;
};

const fallbackImages = {
  dark: "https://img.alicdn.com/imgextra/i3/O1CN01m5mNhC1cx55hC1ekv_!!6000000003666-55-tps-28-28.svg",
  light:
    "https://img.alicdn.com/imgextra/i1/O1CN01WrUtd31o4NAZtoIAp_!!6000000005171-55-tps-28-28.svg",
};

// 提取到组件外部并用 memo 包裹，避免父组件重渲染导致子组件重建
const OfferCard = memo(function OfferCard(props: TypeOfferCardProps) {
  const {
    mediaId,
    title,
    images = [],
    skuProps = [],
    styles,
    isShared,
    isMobile,
  } = props;
  const displayImages = getDisplayImages(images);
  const totalCount = getTotalMaterialCount(images, skuProps);
  const store = useStore();

  return (
    <div
      className={classNames(
        styles.offerCard,
        displayImages.length === 0 && styles.noImages,
      )}
    >
      <div className={styles.offerContainer}>
        <div className={styles.imagesGroup}>
          {displayImages.map((imgUrl, index) => (
            <ProgressiveImage
              key={`${imgUrl}_${index}`}
              className={styles.imageItem}
              src={imgUrl}
              fallback={fallbackImages[store.theme]}
            />
          ))}
        </div>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>
          {$t(
            "global-1688-ai-app.ChatContent.content.bubbles.offer.imageCount",
            `共${totalCount}张素材`,
          )}
        </div>
        {!isShared && !isMobile && (
          <Button
            type="primary"
            className={styles.view}
            onClick={() => {
              if (mediaId) {
                store?.locateElement(mediaId);
              }
            }}
          >
            {$t(
              "global-1688-ai-app.ChatContent.content.bubbles.offer.viewResult",
              "查看结果",
            )}
          </Button>
        )}
      </div>
    </div>
  );
});

// Loading 状态 UI（内部组件）
const LoadingUI = (props: {
  startTime?: number;
  endTime?: number;
  queueWaitingEndTime?: number;
  styles: Record<string, string>;
}) => {
  const { startTime, endTime, queueWaitingEndTime, styles } = props;
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // 有排队或生成进度时才需要定时更新
    if (!queueWaitingEndTime && !startTime && !endTime) return;

    const timer = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, queueWaitingEndTime]);

  // 使用公共函数计算进度状态
  const { isInQueue, queueWaitingSeconds, generateRemainingSeconds } =
    getProgressState({
      is_uncompleted: true,
      startTime,
      endTime,
      queueWaitingEndTime,
    });

  // 计算进度条百分比：
  // 排队阶段 startTime→queueWaitingEndTime
  // 生成阶段 startTime→endTime
  const barPercent = (() => {
    if (isInQueue) {
      return calculatePercent(startTime || 0, queueWaitingEndTime || 0);
    }
    return calculatePercent(startTime || 0, endTime || 0);
  })();

  return (
    <div className={styles.offerBubbleLoading}>
      {/* 排队、生成、超时阶段统一显示文案 */}
      <div>
        {getProgressText(
          isInQueue,
          queueWaitingSeconds,
          generateRemainingSeconds,
          $t,
        )}
      </div>
      {/* 进度条 */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </div>
  );
};

// Failed 状态 UI（内部组件）
const FailedUI = (props: { styles: Record<string, string> }) => {
  const { styles } = props;
  const store = useStore();

  return (
    <div className={styles.offerBubbleFailed}>
      <ProgressiveImage
        className={styles.failedImage}
        src={fallbackImages[store.theme]}
      />
      <div className={styles.failedText}>
        {$t(
          "global-1688-ai-app.ChatContent.content.bubbles.offer.failed",
          "商品生成失败",
        )}
      </div>
    </div>
  );
};

const OfferBubble = (props: TypeOfferBubbleProps) => {
  const { content, isMobile = false, isShared = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;

  // Loading 状态
  if (content?.is_uncompleted) {
    return (
      <LoadingUI
        startTime={content.startTime}
        endTime={content.endTime}
        queueWaitingEndTime={content.queueWaitingEndTime}
        styles={styles}
      />
    );
  }

  // Failed 状态
  if (content?.failed) {
    return <FailedUI styles={styles} />;
  }

  // 成功状态
  return (
    <div className={styles.offerBubble}>
      {(content?.content || []).map((offerItem) => (
        <OfferCard
          isMobile={isMobile}
          isShared={isShared}
          key={offerItem.offerId}
          styles={styles}
          {...(offerItem || {})}
        />
      ))}
    </div>
  );
};

export default OfferBubble;
