import { useState } from "react";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
import TextBubble from "./text";
import MultiImageBubble from "./multi-media";
import DesignBubble from "./design";
import { CompleteIcon as CompleteIconSvg } from "../icons";

interface TypeContentBlock {
  type: "text" | "multi_media" | "design";
  content: any;
}

interface TypeStepCardProps {
  content: {
    stepId: string | number;
    stepTitle: string;
    planId: string;
    is_uncompleted: boolean;
    // 新的结构：支持多个内容块
    contentBlocks?: TypeContentBlock[];
    // 旧的结构：向后兼容
    textContent?: any;
    multiMediaContent?: any;
    designContent?: any;
  };
  isMobile?: boolean;
}

// Loading 图标组件（转圈动画）
const LoadingIcon = ({ styles }: { styles: Record<string, string> }) => (
  <div className={styles.stepStatusIcon}>
    <div className={styles.loadingSpinner} />
  </div>
);

// 完成图标组件
const CompleteIcon = ({ styles }: { styles: Record<string, string> }) => (
  <div className={styles.stepStatusIcon}>
    <CompleteIconSvg className={styles.completeIconSvg} />
  </div>
);

export default function StepCardBubble(props: TypeStepCardProps) {
  const { content, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;

  const {
    stepTitle,
    contentBlocks,
    textContent,
    multiMediaContent,
    designContent,
    is_uncompleted,
  } = content || {};
  const [collapsed, setCollapsed] = useState(false);

  // 检查是否有内容需要显示
  // 优先使用新的 contentBlocks 结构，向后兼容旧结构
  const hasContent =
    (contentBlocks && contentBlocks.length > 0) ||
    (textContent && textContent.content) ||
    (multiMediaContent && multiMediaContent.multiImages) ||
    (designContent && designContent.type === "design");

  // 渲染单个内容块
  const renderContentBlock = (block: TypeContentBlock, index: number) => {
    const { type, content: blockContent } = block;

    switch (type) {
      case "text":
        if (blockContent && blockContent.content) {
          return (
            <div key={`text-${index}`} className={styles.stepCardText}>
              <TextBubble content={blockContent} isMobile={isMobile} />
            </div>
          );
        }
        break;

      case "multi_media":
        if (blockContent && blockContent.multiImages) {
          return (
            <div key={`multi-${index}`} className={styles.stepCardMedia}>
              <MultiImageBubble content={blockContent} isMobile={isMobile} />
            </div>
          );
        }
        break;

      case "design":
        if (blockContent && blockContent.type === "design") {
          return (
            <div key={`design-${index}`} className={styles.stepCardDesign}>
              <DesignBubble content={blockContent} isMobile={isMobile} />
            </div>
          );
        }
        break;

      default:
        return null;
    }

    return null;
  };

  return (
    <div className={styles.stepCardContainer}>
      {/* 步骤标题 */}
      <div className={styles.stepCardHeader}>
        <div className={styles.stepCardHeaderLeft}>
          {/* 状态图标 */}
          {is_uncompleted ? (
            <LoadingIcon styles={styles} />
          ) : (
            <CompleteIcon styles={styles} />
          )}
          <div className={styles.stepCardTitle}>{stepTitle}</div>
        </div>
        {hasContent && (
          <div
            className={styles.arrowDown}
            style={{
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            }}
            onClick={() => setCollapsed(!collapsed)}
          />
        )}
      </div>

      {/* 步骤内容 */}
      {!collapsed && hasContent && (
        <div className={styles.stepCardContent}>
          {/* 优先使用新的 contentBlocks 结构 */}
          {contentBlocks && contentBlocks.length > 0 ? (
            contentBlocks.map((block, index) =>
              renderContentBlock(block, index)
            )
          ) : (
            <>
              {/* 向后兼容：旧的数据结构 */}
              {textContent && textContent.content && (
                <div className={styles.stepCardText}>
                  <TextBubble content={textContent} isMobile={isMobile} />
                </div>
              )}

              {designContent && designContent.type === "design" && (
                <div className={styles.stepCardDesign}>
                  <DesignBubble content={designContent} isMobile={isMobile} />
                </div>
              )}

              {multiMediaContent && multiMediaContent.multiImages && (
                <div className={styles.stepCardMedia}>
                  <MultiImageBubble
                    content={multiMediaContent}
                    isMobile={isMobile}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
