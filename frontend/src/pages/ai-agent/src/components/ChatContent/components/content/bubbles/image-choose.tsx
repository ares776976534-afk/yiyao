import { useState } from "react";
import classNames from "classnames";
import { Checkbox, Button } from "antd";
import ArrowIcon from "@/components/Icons/Arrow";
import ProgressiveImage from "@/components/ProgressiveImage";
import { SameIcon } from "@/components/CaseShareController/icons";
import { useStore } from "@/stores/context";
import { $t } from "@/i18n";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";

interface TypeImageChooseProps {
  content: any;
  isMobile?: boolean;
  isShared?: boolean;
  onUserResponse?: (userInput: {
    resumePoint?: string;
    chooseStatus: "accept" | "refuse";
    chooseIndex?: number | number[];
  }) => void;
}

const FALLBACK_IMAGES = {
  dark: "https://img.alicdn.com/imgextra/i3/O1CN01m5mNhC1cx55hC1ekv_!!6000000003666-55-tps-28-28.svg",
  light:
    "https://img.alicdn.com/imgextra/i1/O1CN01WrUtd31o4NAZtoIAp_!!6000000005171-55-tps-28-28.svg",
};

export default function ImageChooseBubble(props: TypeImageChooseProps) {
  const { content, isMobile = false, isShared = false, onUserResponse } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const [collapsed, setCollapsed] = useState(false);
  const store = useStore();

  // 提前获取 fallback 图片，避免在 map 循环中重复计算
  const fallbackImage = FALLBACK_IMAGES[store.theme];

  // 是否多选模式
  const isMultiSelect = content?.multiSelect === true;

  // 从 content 中读取历史选择状态（详情页/分享页场景）
  const hasHistoryChoice = content?.chooseStatus !== undefined;
  const historyChooseIndex = content?.chooseIndex;

  // 单选：number，多选：number[]
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>(() => {
    if (!hasHistoryChoice || content?.chooseStatus !== "accept") {
      return [];
    }
    // 兼容单选（number）和多选（number[]）的历史数据
    if (Array.isArray(historyChooseIndex)) {
      return historyChooseIndex;
    }
    if (historyChooseIndex >= 0) {
      return [historyChooseIndex];
    }
    return [];
  });
  const [submitted, setSubmitted] = useState(hasHistoryChoice);
  const [chooseStatus, setChooseStatus] = useState<
    "accept" | "refuse" | undefined
  >(content?.chooseStatus);

  // 从 content 中获取图片列表
  const imageList: string[] = content?.images || [];

  // 是否有选中项
  const hasSelected = selectedIndexes.length > 0;

  // 节点类型
  const nodeType = content?.node;

  // 构建响应数据
  const buildResponseData = (accept: boolean, indexes: number[]) => {
    const baseData = accept
      ? {
          chooseStatus: "accept" as const,
          chooseIndex: isMultiSelect ? indexes : indexes[0],
        }
      : {
          chooseStatus: "refuse" as const,
        };

    // 个人知识库节点：额外添加 resumePoint
    if (nodeType === "personal_kb") {
      return {
        resumePoint: "personal_kb_confirm",
        ...baseData,
      };
    }

    return baseData;
  };

  // 处理使用该参考
  const handleConfirm = () => {
    if (!hasSelected || !onUserResponse) {
      return;
    }
    setChooseStatus("accept");
    setSubmitted(true);
    onUserResponse(buildResponseData(true, selectedIndexes));
  };

  // 处理跳过
  const handleSkip = () => {
    if (!onUserResponse) {
      return;
    }
    setSelectedIndexes([]);
    setChooseStatus("refuse");
    setSubmitted(true);
    onUserResponse(buildResponseData(false, []));
  };

  return (
    <div className={styles.imageChooseContainer}>
      <div
        className={styles.imageChooseTitle}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setCollapsed(!collapsed);
        }}
      >
        {/* icon 通过 mask + background-color 实现变色，颜色由 CSS 控制 */}
        {content?.icon && (
          <div
            className={styles.imageChooseIcon}
            style={{
              maskImage: `url(${content?.icon})`,
            }}
          />
        )}
        {content?.title && (
          <div className={styles.imageChooseTitleText}>{content?.title}</div>
        )}
        <ArrowIcon
          className={classNames(styles.imageChooseTitleArrow, {
            [styles.collapsed]: collapsed,
          })}
        />
      </div>
      <div>
        {content?.description && (
          <div className={styles.imageChooseDescription}>
            {content?.description}
          </div>
        )}
      </div>
      <div
        className={classNames({
          [styles.imageChooseContentCollapsed]: collapsed,
        })}
      >
        <div className={styles.imageChooseContent}>
          {imageList.map((item, index) => {
            const isSelected = selectedIndexes.includes(index);
            // 状态枚举:
            // 1. initial: 未选择任何项 - 无遮罩，全部可 hover
            // 2. selecting: 正在选择中，有选中项但未提交 - 单选时未选中项有遮罩，多选时无遮罩
            // 3. accepted: 已确认选择 - 未选中项遮罩 z-index > checkbox
            // 4. refused: 已跳过 - 全部遮罩 z-index > checkbox
            const isSelecting = hasSelected && !submitted;
            const isAccepted = submitted && chooseStatus === "accept";
            const isRefused = submitted && chooseStatus === "refuse";

            // 是否需要遮罩（多选模式下选择中不需要遮罩未选中项）
            const needMask =
              (isSelecting && !isSelected && !isMultiSelect) || // 单选选择中，未选中项需遮罩
              (isAccepted && !isSelected) || // 已确认，未选中项需遮罩
              isRefused; // 已跳过，全部需遮罩

            // 遮罩是否覆盖 checkbox (z-index > 2)
            const maskOverCheckbox = isAccepted || isRefused;

            return (
              <label
                className={classNames(styles.imageChooseContentItem, {
                  [styles.hasMask]: needMask,
                  [styles.maskOverCheckbox]: maskOverCheckbox,
                  [styles.disabled]: isShared || submitted, // 已提交，禁用交互
                })}
                key={index}
              >
                <ProgressiveImage
                  className={styles.imageChooseContentItemImage}
                  src={item}
                  fallback={fallbackImage}
                />
                <Checkbox
                  className={styles.imageChooseContentItemCheckbox}
                  checked={isSelected}
                  onChange={(event) => {
                    if (isShared || submitted) {
                      return;
                    }
                    if (isMultiSelect) {
                      // 多选：切换选中状态
                      if (event.target.checked) {
                        setSelectedIndexes((prev) => [...prev, index]);
                      } else {
                        setSelectedIndexes((prev) =>
                          prev.filter((idx) => idx !== index),
                        );
                      }
                    } else {
                      // 单选：只能选一个
                      setSelectedIndexes(event.target.checked ? [index] : []);
                    }
                  }}
                />
              </label>
            );
          })}
        </div>
        <div className={styles.imageChooseContentFooter}>
          {submitted ? (
            <Button className={styles.imageChooseContentFooterButton} disabled>
              {chooseStatus === "refuse"
                ? $t(
                    "global-1688-ai-app.ChatContent.content.bubbles.trending-card.skipped",
                    "您已跳过该环节",
                  )
                : $t(
                    "global-1688-ai-app.ChatContent.content.bubbles.trending-card.used",
                    "已使用该参考",
                  )}
            </Button>
          ) : (
            <>
              <Button
                className={styles.imageChooseContentFooterButton}
                onClick={handleSkip}
                disabled={isShared}
              >
                {$t(
                  "global-1688-ai-app.ChatContent.content.bubbles.trending-card.skip",
                  "跳过该环节",
                )}
              </Button>
              <Button
                type="primary"
                disabled={isShared || !hasSelected}
                className={styles.imageChooseContentFooterButton}
                onClick={handleConfirm}
              >
                <SameIcon />
                {$t(
                  "global-1688-ai-app.ChatContent.content.bubbles.trending-card.use",
                  "使用该参考",
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
